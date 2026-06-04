<!-- Generator: Widdershins v4.0.1 -->

<h1 id="ukl-backend-api">UKL Backend API v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

REST API untuk aplikasi e-commerce UKL. Dibangun dengan NestJS + Prisma + MySQL. Gunakan endpoint `/auth/login` untuk mendapatkan JWT token, lalu klik tombol **Authorize** di atas dan masukkan token.

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer Masukkan JWT token yang didapat dari endpoint login

<h1 id="ukl-backend-api-auth">Auth</h1>

Registrasi & Login pengguna

## AuthController_findAllUsers

<a id="opIdAuthController_findAllUsers"></a>

> Code samples

`GET /auth/users`

*Daftar semua pengguna (Admin)*

Mengambil daftar seluruh pengguna. Hanya bisa diakses oleh Admin.

> Example responses

> 200 Response

```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "CUSTOMER",
    "createdAt": "2019-08-24T14:15:22Z"
  }
]
```

<h3 id="authcontroller_findallusers-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil daftar pengguna|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|

<h3 id="authcontroller_findallusers-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» id|string|false|none|none|
|» name|string¦null|false|none|none|
|» email|string|false|none|none|
|» role|string|false|none|none|
|» createdAt|string(date-time)|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## AuthController_createAdmin

<a id="opIdAuthController_createAdmin"></a>

> Code samples

`POST /auth/register/admin`

*Registrasi admin baru (Admin)*

Membuat akun admin baru dengan email dan password. Hanya bisa diakses oleh Admin.

<h3 id="authcontroller_createadmin-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Registrasi berhasil|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Email sudah terdaftar atau validasi gagal|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## AuthController_createCustomer

<a id="opIdAuthController_createCustomer"></a>

> Code samples

`POST /auth/register/customer`

*Registrasi pelanggan baru*

Membuat akun pelanggan baru dengan email dan password. Email harus unik.

<h3 id="authcontroller_createcustomer-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Registrasi berhasil|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Email sudah terdaftar atau validasi gagal|None|

<aside class="success">
This operation does not require authentication
</aside>

## AuthController_login

<a id="opIdAuthController_login"></a>

> Code samples

`POST /auth/login`

*Login pengguna*

Autentikasi dengan email dan password. Mengembalikan JWT access token.

> Example responses

> 200 Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

<h3 id="authcontroller_login-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login berhasil|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Email atau password salah|None|

<h3 id="authcontroller_login-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» access_token|string|false|none|none|
|» user|object|false|none|none|
|»» id|string|false|none|none|
|»» email|string|false|none|none|
|»» role|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="ukl-backend-api-categories">Categories</h1>

Manajemen kategori produk

## CategoryController_findAll

<a id="opIdCategoryController_findAll"></a>

> Code samples

`GET /categories`

*Daftar semua kategori*

Mengambil daftar kategori dengan pagination dan filter. Endpoint publik.

<h3 id="categorycontroller_findall-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil daftar kategori|None|

<aside class="success">
This operation does not require authentication
</aside>

## CategoryController_create

<a id="opIdCategoryController_create"></a>

> Code samples

`POST /categories`

*Buat kategori baru (Admin)*

Membuat kategori baru. Hanya bisa diakses oleh Admin.

<h3 id="categorycontroller_create-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Kategori berhasil dibuat|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Slug sudah ada atau validasi gagal|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## CategoryController_listAll

<a id="opIdCategoryController_listAll"></a>

> Code samples

`GET /categories/all`

*Daftar semua kategori aktif (Publik)*

Mengambil semua kategori aktif tanpa filter.

<h3 id="categorycontroller_listall-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil semua kategori|None|

<aside class="success">
This operation does not require authentication
</aside>

## CategoryController_findOne

<a id="opIdCategoryController_findOne"></a>

> Code samples

`GET /categories/{id}`

*Detail kategori*

Mengambil detail satu kategori berdasarkan ID.

<h3 id="categorycontroller_findone-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID kategori (CUID)|

<h3 id="categorycontroller_findone-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil detail kategori|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Kategori tidak ditemukan|None|

<aside class="success">
This operation does not require authentication
</aside>

## CategoryController_update

<a id="opIdCategoryController_update"></a>

> Code samples

`PATCH /categories/{id}`

*Update kategori (Admin)*

Mengupdate data kategori. Hanya bisa diakses oleh Admin.

<h3 id="categorycontroller_update-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID kategori (CUID)|

<h3 id="categorycontroller_update-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Kategori berhasil diupdate|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Slug sudah ada atau validasi gagal|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Kategori tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## CategoryController_remove

<a id="opIdCategoryController_remove"></a>

> Code samples

`DELETE /categories/{id}`

*Hapus kategori (Admin)*

Menghapus kategori berdasarkan ID. Hanya bisa diakses oleh Admin.

<h3 id="categorycontroller_remove-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID kategori (CUID)|

<h3 id="categorycontroller_remove-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Kategori berhasil dihapus|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Kategori tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

<h1 id="ukl-backend-api-products">Products</h1>

Manajemen produk, SKU, dan inventory

## ProductController_list

<a id="opIdProductController_list"></a>

> Code samples

`GET /products`

*Daftar produk (Publik)*

Mengambil daftar produk aktif dengan pagination dan filter berdasarkan kategori, warna, ukuran, dan rentang harga.

<h3 id="productcontroller_list-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil daftar produk|None|

<aside class="success">
This operation does not require authentication
</aside>

## ProductController_create

<a id="opIdProductController_create"></a>

> Code samples

`POST /products`

*Buat produk atau SKU baru (Admin)*

Membuat produk baru (type=PRODUCT) atau menambah varian/SKU ke produk yang sudah ada (type=SKU). Hanya Admin yang bisa mengakses.

<h3 id="productcontroller_create-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Produk/SKU berhasil dibuat|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validasi gagal atau slug/SKU duplikat|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## ProductController_listAll

<a id="opIdProductController_listAll"></a>

> Code samples

`GET /products/all`

*Daftar semua produk dan kategori aktif (Publik)*

Mengambil semua produk aktif dan kategori aktif tanpa filter.

<h3 id="productcontroller_listall-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil semua produk dan kategori|None|

<aside class="success">
This operation does not require authentication
</aside>

## ProductController_detail

<a id="opIdProductController_detail"></a>

> Code samples

`GET /products/{slug}`

*Detail produk (Publik)*

Mengambil detail produk berdasarkan slug, termasuk SKU dan inventory.

<h3 id="productcontroller_detail-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|slug|path|any|true|Slug produk|

<h3 id="productcontroller_detail-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil detail produk|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Produk tidak ditemukan atau tidak aktif|None|

<aside class="success">
This operation does not require authentication
</aside>

## ProductController_updateProduct

<a id="opIdProductController_updateProduct"></a>

> Code samples

`PATCH /products/{id}`

*Update produk (Admin)*

Mengupdate data produk. Gunakan type=PRODUCT atau kosongkan type.

<h3 id="productcontroller_updateproduct-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID produk (CUID)|

<h3 id="productcontroller_updateproduct-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Produk berhasil diupdate|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validasi gagal atau slug duplikat|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Produk tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## ProductController_remove

<a id="opIdProductController_remove"></a>

> Code samples

`DELETE /products/{id}`

*Hapus produk (Admin)*

Menghapus produk beserta semua SKU dan inventory terkait.

<h3 id="productcontroller_remove-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID produk (CUID)|

<h3 id="productcontroller_remove-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Produk berhasil dihapus|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Produk tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## ProductController_uploadImage

<a id="opIdProductController_uploadImage"></a>

> Code samples

`POST /products/{id}/image`

*Upload gambar produk (Admin)*

Upload gambar produk ke Cloudinary. File dikirim sebagai multipart/form-data.

> Body parameter

```yaml
file: string

```

<h3 id="productcontroller_uploadimage-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID produk (CUID)|
|body|body|object|true|File gambar produk|
|» file|body|string(binary)|true|File gambar (JPG/PNG)|

<h3 id="productcontroller_uploadimage-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Gambar berhasil diupload|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|File tidak ditemukan|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Produk tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## ProductController_updateSku

<a id="opIdProductController_updateSku"></a>

> Code samples

`PATCH /skus/{id}`

*Update SKU/varian (Admin)*

Mengupdate warna dan/atau ukuran SKU. Gunakan type=SKU di body.

<h3 id="productcontroller_updatesku-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID SKU (CUID)|

<h3 id="productcontroller_updatesku-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|SKU berhasil diupdate|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validasi gagal atau SKU duplikat|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|SKU tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## ProductController_updateStock

<a id="opIdProductController_updateStock"></a>

> Code samples

`PATCH /inventories/{skuId}`

*Update stok inventory (Admin)*

Mengupdate jumlah stok untuk SKU tertentu. Gunakan type=STOCK di body.

<h3 id="productcontroller_updatestock-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|path|any|true|ID SKU (CUID)|

<h3 id="productcontroller_updatestock-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Stok berhasil diupdate|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|type harus STOCK dan stock wajib diisi|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|SKU tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

<h1 id="ukl-backend-api-orders">Orders</h1>

Checkout, pembayaran, dan manajemen pesanan

## OrderController_checkout

<a id="opIdOrderController_checkout"></a>

> Code samples

`POST /checkout`

*Checkout / buat pesanan baru*

Membuat pesanan baru. Stok akan berkurang secara atomik. Jika shippingType=DELIVERY, wajib isi district dan shippingAddress. Pesanan yang tidak dibayar dalam 1 jam akan otomatis dibatalkan.

<h3 id="ordercontroller_checkout-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Pesanan berhasil dibuat|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validasi gagal, stok tidak cukup, atau SKU tidak ditemukan|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_listMy

<a id="opIdOrderController_listMy"></a>

> Code samples

`GET /orders`

*Daftar pesanan saya*

Mengambil daftar pesanan milik user yang sedang login, dengan pagination dan filter status.

<h3 id="ordercontroller_listmy-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil daftar pesanan|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_getMy

<a id="opIdOrderController_getMy"></a>

> Code samples

`GET /orders/{id}`

*Detail pesanan saya*

Mengambil detail pesanan berdasarkan ID. Hanya bisa melihat pesanan milik sendiri.

<h3 id="ordercontroller_getmy-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID pesanan (CUID)|

<h3 id="ordercontroller_getmy-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Berhasil mengambil detail pesanan|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Pesanan bukan milik user ini|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Pesanan tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_uploadProof

<a id="opIdOrderController_uploadProof"></a>

> Code samples

`POST /orders/{id}/payment-proof`

*Upload bukti pembayaran*

Upload bukti transfer untuk pesanan yang masih PENDING. Setelah upload, status pesanan berubah menjadi WAITING_CONFIRMATION. File dikirim sebagai multipart/form-data.

> Body parameter

```yaml
file: string
note: Transfer via BCA a/n Budi

```

<h3 id="ordercontroller_uploadproof-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID pesanan (CUID)|
|body|body|object|true|File bukti pembayaran dan catatan opsional|
|» file|body|string(binary)|true|File bukti transfer (JPG/PNG)|
|» note|body|string|false|Catatan opsional|

<h3 id="ordercontroller_uploadproof-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Bukti pembayaran berhasil diupload|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Pesanan bukan PENDING atau bukti sudah diupload|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Pesanan bukan milik user ini|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Pesanan tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_downloadReceipt

<a id="opIdOrderController_downloadReceipt"></a>

> Code samples

`GET /orders/{id}/receipt`

*Download struk pembelian (PDF)*

<h3 id="ordercontroller_downloadreceipt-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID order|

<h3 id="ordercontroller_downloadreceipt-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_updateStatus

<a id="opIdOrderController_updateStatus"></a>

> Code samples

`PATCH /orders/{id}/status`

*Update status pesanan (Admin)*

Admin mengubah status pesanan. Transisi yang diizinkan:
- PENDING → CANCELLED
- WAITING_CONFIRMATION → PAID / CANCELLED
- PAID → SHIPPED

Jika dibatalkan, stok akan dikembalikan secara otomatis.

<h3 id="ordercontroller_updatestatus-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID pesanan (CUID)|

<h3 id="ordercontroller_updatestatus-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Status pesanan berhasil diupdate|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Transisi status tidak valid|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Hanya Admin yang bisa mengakses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Pesanan tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

## OrderController_remove

<a id="opIdOrderController_remove"></a>

> Code samples

`DELETE /{id}`

*Hapus pesanan*

Menghapus pesanan berdasarkan ID. Bisa diakses oleh Customer dan Admin.

<h3 id="ordercontroller_remove-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|any|true|ID pesanan (CUID)|

<h3 id="ordercontroller_remove-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Pesanan berhasil dihapus|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid atau tidak ada|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Tidak memiliki akses|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Pesanan tidak ditemukan|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
JWT-auth
</aside>

<h1 id="ukl-backend-api-app">app</h1>

## AppController_getHello

<a id="opIdAppController_getHello"></a>

> Code samples

`GET /`

*Root endpoint*

> Example responses

> 200 Response

```json
"Hello World!"
```

<h3 id="appcontroller_gethello-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Basic welcome message|string|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

