import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async generateReceipt(
    orderId: string,
    userId: string,
    userRole: Role,
  ): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            sku: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // Cek akses: hanya pemilik order atau admin
    if (userRole !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke struk ini');
    }

    // Cek status: hanya PAID atau SHIPPED
    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.SHIPPED
    ) {
      throw new ForbiddenException(
        'Struk hanya tersedia setelah pembayaran dikonfirmasi',
      );
    }

    const formatRupiah = (n: number) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(n);

    const formatDate = (d: Date) =>
      new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(d);

    const itemRows = order.items.map((item) => [
      { text: item.sku.product.name },
      { text: `${item.sku.color} / ${item.sku.size}` },
      { text: item.quantity.toString(), alignment: 'center' },
      { text: formatRupiah(item.price), alignment: 'right' },
      { text: formatRupiah(item.price * item.quantity), alignment: 'right' },
    ]);

    const docDefinition = {
      content: [
        { text: 'STRUK PEMBELIAN', style: 'header' },
        { text: 'SneakerLocal', style: 'subheader' },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 },
          ],
          margin: [0, 8, 0, 8],
        },

        {
          columns: [
            [
              { text: 'No. Order', style: 'label' },
              { text: order.id, style: 'value' },
              { text: 'Nama Pembeli', style: 'label', margin: [0, 6, 0, 0] },
              { text: order.user.name ?? order.user.email, style: 'value' },
            ],
            [
              { text: 'Tanggal', style: 'label' },
              {
                text: formatDate(order.paidAt ?? order.updatedAt),
                style: 'value',
              },
              { text: 'Status', style: 'label', margin: [0, 6, 0, 0] },
              { text: order.status, style: 'value' },
            ],
          ],
          margin: [0, 0, 0, 12],
        },

        { text: 'Detail Produk', style: 'sectionTitle' },
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'Produk', style: 'tableHeader' },
                { text: 'Varian', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                {
                  text: 'Harga Satuan',
                  style: 'tableHeader',
                  alignment: 'right',
                },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
              ],
              ...itemRows,
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12],
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 },
          ],
          margin: [0, 0, 0, 6],
        },
        {
          columns: [
            { text: '' },
            {
              width: 'auto',
              table: {
                body: [
                  [
                    'Subtotal',
                    { text: formatRupiah(order.subtotal), alignment: 'right' },
                  ],
                  [
                    'Ongkos Kirim',
                    {
                      text: formatRupiah(order.shippingFee),
                      alignment: 'right',
                    },
                  ],
                  [
                    { text: 'TOTAL', bold: true },
                    {
                      text: formatRupiah(order.total),
                      bold: true,
                      alignment: 'right',
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
          ],
        },

        {
          text: 'Terima kasih telah berbelanja!',
          style: 'footer',
          margin: [0, 24, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 4],
        },
        subheader: {
          fontSize: 12,
          alignment: 'center',
          color: '#666666',
          margin: [0, 0, 0, 8],
        },
        sectionTitle: { fontSize: 11, bold: true, margin: [0, 0, 0, 6] },
        label: { fontSize: 9, color: '#888888' },
        value: { fontSize: 10 },
        tableHeader: { bold: true, fontSize: 10, fillColor: '#f3f3f3' },
        footer: { alignment: 'center', color: '#888888', italics: true },
      },
      defaultStyle: { fontSize: 10 },
    };

    return this.pdfService.generateBuffer(docDefinition as any);
  }
}
