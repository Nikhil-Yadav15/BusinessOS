# Identity

# **Module Structure**

Identity  
│  
├── user  
├── session  
├── device  
└── otp

Only **4 tables**.

Simple.

Scalable.

Easy to maintain.

---

# **Table 1 — user**

## **Classification**

Master

---

## **Purpose**

Represents a person who can authenticate into Atlas.

A single user may belong to multiple businesses through the **Business Module**.

Example

Rahul Sharma

↓

ABC Traders (Owner)

↓

XYZ Pharma (Accountant)  
---

## **Business Rules**

* Mobile number is mandatory.  
* Mobile number must be unique.  
* Email is optional.  
* Email must be unique if provided.  
* Password is always stored as a secure hash.  
* Users are never physically deleted.  
* Account status controls login ability.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| full\_name | VARCHAR(150) | No |  |
| mobile | VARCHAR(15) | No | Unique |
| email | VARCHAR(255) | Yes | Unique |
| password\_hash | TEXT | Yes | Null for OTP-only accounts |
| status | ENUM | No | ACTIVE / INACTIVE / LOCKED |
| last\_login\_at | TIMESTAMPTZ | Yes |  |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Indexes**

PRIMARY KEY (id)

UNIQUE (mobile)

UNIQUE (email)  
WHERE email IS NOT NULL  
---

## **Notes**

Password hashing:

* Argon2id (preferred)  
* bcrypt (acceptable)

Never store:

* OTP  
* Refresh Tokens  
* Device Info  
* Session Info

---

# **Table 2 — session**

## **Classification**

System

---

## **Purpose**

Represents an authenticated login session.

Every login creates a new session.

---

## **Business Rules**

* Store only hashed refresh tokens.  
* Sessions expire automatically.  
* Users can revoke individual sessions.  
* Users can logout from all devices.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| user\_id | UUIDv7 | No |
| device\_id | UUIDv7 | Yes |
| refresh\_token\_hash | TEXT | No |
| ip\_address | INET | Yes |
| user\_agent | TEXT | Yes |
| expires\_at | TIMESTAMPTZ | No |
| last\_activity\_at | TIMESTAMPTZ | No |
| revoked\_at | TIMESTAMPTZ | Yes |
| created\_at | TIMESTAMPTZ | No |

---

## **Relationships**

User (1)

↓

Session (Many)  
---

## **Indexes**

(user\_id)

(expires\_at)

(revoked\_at)  
---

# **Table 3 — device**

## **Classification**

System

---

## **Purpose**

Stores trusted user devices.

Allows:

* Device management  
* Trusted devices  
* Login history  
* Session association

---

## **Business Rules**

A user can register multiple devices.

Removing a device does not delete sessions.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| user\_id | UUIDv7 | No |
| device\_name | VARCHAR(100) | Yes |
| platform | VARCHAR(30) | Yes |
| app\_version | VARCHAR(20) | Yes |
| device\_identifier | TEXT | No |
| is\_trusted | BOOLEAN | No |
| last\_seen\_at | TIMESTAMPTZ | Yes |
| created\_at | TIMESTAMPTZ | No |

---

## **Relationships**

User (1)

↓

Device (Many)  
---

## **Indexes**

(user\_id)

(device\_identifier)  
---

# **Table 4 — otp**

## **Classification**

Transaction

---

## **Purpose**

Stores OTP verification requests.

Supports:

* Login  
* Mobile verification  
* Password reset

---

## **Business Rules**

* OTP must never be stored in plaintext.  
* Store only the hash.  
* OTP expires automatically.  
* Maximum retry attempts.  
* Cleanup via scheduled job.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| mobile | VARCHAR(15) | No |
| purpose | ENUM | No |
| otp\_hash | TEXT | No |
| attempts | SMALLINT | No |
| expires\_at | TIMESTAMPTZ | No |
| verified\_at | TIMESTAMPTZ | Yes |
| created\_at | TIMESTAMPTZ | No |

---

## **Purpose Enum**

LOGIN

PASSWORD\_RESET

MOBILE\_VERIFICATION  
---

## **Indexes**

(mobile)

(expires\_at)  
---

# **Relationships**

User  
│  
├─────────────┐  
│             │  
▼             ▼  
Session      Device

OTP  
(Independent)  
---

# **Authentication Flow**

User enters Mobile Number  
           │  
           ▼  
    OTP / Password  
           │  
           ▼  
   Identity verifies  
           │  
           ▼  
    Create Session  
           │  
           ▼  
  Return Access Token

# Buisness

# **Module Structure**

Business  
│  
├── business  
├── business\_member  
└── business\_settings

Only **3 tables**.

---

# **Table 1 — business**

## **Classification**

Master

---

## **Purpose**

Stores the primary information about a business.

Every other business-owned table references this table using `business_id`.

---

## **Business Rules**

* Every business has one owner.  
* GSTIN is optional.  
* PAN is optional.  
* Businesses are never deleted.  
* Businesses can be deactivated.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| name | VARCHAR(150) | No | Display Name |
| legal\_name | VARCHAR(200) | Yes | Registered Business Name |
| business\_type | ENUM | No | Business Category |
| gstin | VARCHAR(15) | Yes | Unique if provided |
| pan | VARCHAR(10) | Yes |  |
| phone | VARCHAR(15) | No |  |
| email | VARCHAR(255) | Yes |  |
| address\_line1 | VARCHAR(255) | Yes |  |
| address\_line2 | VARCHAR(255) | Yes |  |
| city | VARCHAR(100) | Yes |  |
| state | VARCHAR(100) | Yes |  |
| pincode | VARCHAR(10) | Yes |  |
| logo\_url | TEXT | Yes |  |
| status | ENUM | No | ACTIVE / INACTIVE |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Business Type**

RETAIL  
WHOLESALE  
DISTRIBUTOR  
MANUFACTURER  
SERVICE  
---

## **Status**

ACTIVE  
INACTIVE  
---

## **Indexes**

PRIMARY KEY (id)

UNIQUE (gstin)  
WHERE gstin IS NOT NULL

INDEX (name)

INDEX (phone)  
---

# **Table 2 — business\_member**

## **Classification**

Master

---

## **Purpose**

Associates users with businesses.

This table **only** defines membership.

It does **not** define permissions.

Permissions will be handled in the Security module.

---

## **Business Rules**

* A user may belong to multiple businesses.  
* A business has multiple users.  
* Membership can be disabled.  
* One user cannot have duplicate memberships in the same business.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| user\_id | UUIDv7 | No | FK → user |
| joined\_at | TIMESTAMPTZ | No |  |
| status | ENUM | No | ACTIVE / INVITED / REMOVED |

---

## **Status**

ACTIVE

INVITED

REMOVED  
---

## **Constraints**

UNIQUE (business\_id, user\_id)  
---

## **Relationships**

Business (1)

↓

Business Member (Many)

↓

User (Identity)  
---

# **Table 3 — business\_settings**

## **Classification**

Configuration

---

## **Purpose**

Stores configurable business preferences.

Only settings that directly affect business operations belong here.

Avoid storing UI preferences or rarely used options.

---

## **Business Rules**

* One settings record per business.  
* Created automatically when a business is created.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| business\_id | UUIDv7 | No | PK & FK |
| invoice\_prefix | VARCHAR(20) | No | Default "INV" |
| financial\_year\_start | DATE | No |  |
| low\_stock\_threshold | INTEGER | No | Default 10 |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Example**

Business

ABC Traders

↓

Settings

Invoice Prefix : INV

Financial Year : 01-Apr

Low Stock : 10  
---

# **Relationships**

                User  
                 │  
                 │  
                 ▼  
         business\_member  
                 ▲  
                 │  
Business ─────────┤  
    │  
    ▼  
business\_settings

# Catalog

# **Module Structure**

Catalog  
│  
├── category  
├── brand  
├── unit  
├── product  
└── product\_image

Total Tables: **5**

---

# **1\. category**

## **Classification**

Master

---

## **Purpose**

Groups products.

Examples

* Grocery  
* Medicines  
* Electronics  
* Clothing  
* Hardware

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | PK |
| business\_id | UUIDv7 | No | FK → business |
| name | VARCHAR(100) | No |  |
| description | TEXT | Yes |  |
| status | ENUM | No | ACTIVE / INACTIVE |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

### **Constraints**

UNIQUE (business\_id, name)  
---

### **Indexes**

business\_id

name  
---

# **2\. brand**

## **Classification**

Master

---

## **Purpose**

Stores product brands.

Examples

* Amul  
* Britannia  
* Samsung  
* Parle  
* Tata

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| business\_id | UUIDv7 | No |
| name | VARCHAR(100) | No |
| description | TEXT | Yes |
| status | ENUM | No |
| created\_at | TIMESTAMPTZ | No |
| updated\_at | TIMESTAMPTZ | No |

---

### **Constraints**

UNIQUE (business\_id, name)  
---

# **3\. unit**

## **Classification**

Reference

---

## **Purpose**

Defines measurement units.

Examples

Piece

Box

Bottle

Packet

Kg

Gram

Litre

Dozen  
---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| business\_id | UUIDv7 |
| name | VARCHAR(50) |
| short\_name | VARCHAR(20) |
| status | ENUM |
| created\_at | TIMESTAMPTZ |
| updated\_at | TIMESTAMPTZ |

---

### **Example**

| Name | Short |
| ----- | ----- |
| Kilogram | Kg |
| Litre | L |
| Piece | Pc |

---

# **4\. product**

## **Classification**

Master

---

## **Purpose**

Represents a sellable inventory item.

Every product is exactly one SKU.

---

## **Business Rules**

* SKU must be unique within a business.  
* Barcode must be unique if provided.  
* Products cannot be deleted once used.  
* Products can be archived.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | PK |
| business\_id | UUIDv7 | No | FK |
| category\_id | UUIDv7 | Yes | FK |
| brand\_id | UUIDv7 | Yes | FK |
| unit\_id | UUIDv7 | No | FK |
| sku | VARCHAR(100) | No | Unique |
| barcode | VARCHAR(100) | Yes | Unique if provided |
| name | VARCHAR(200) | No |  |
| description | TEXT | Yes |  |
| purchase\_price | DECIMAL(18,2) | No |  |
| selling\_price | DECIMAL(18,2) | No |  |
| mrp | DECIMAL(18,2) | Yes |  |
| gst\_rate | DECIMAL(5,2) | No | Example: 5, 12, 18 |
| minimum\_stock | DECIMAL(18,3) | No | Default 0 |
| hsn\_code | VARCHAR(20) | Yes | GST HSN/SAC Code |
| status | ENUM | No | ACTIVE / INACTIVE |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

### **Status**

ACTIVE

INACTIVE  
---

### **Constraints**

UNIQUE (business\_id, sku)

UNIQUE (business\_id, barcode)  
WHERE barcode IS NOT NULL  
---

### **Indexes**

business\_id

category\_id

brand\_id

sku

barcode

name  
---

# **5\. product\_image**

## **Classification**

Master

---

## **Purpose**

Stores product image metadata.

The actual image is stored in object storage.

---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| product\_id | UUIDv7 |
| image\_url | TEXT |
| display\_order | SMALLINT |
| created\_at | TIMESTAMPTZ |

---

## **Constraints**

One product

↓

Many Images  
---

# **Relationships**

Business  
   │  
   ├───────────────┐  
   │               │  
   ▼               ▼  
Category         Brand  
   │               │  
   └──────┐   ┌────┘  
          ▼   ▼  
         Product  
            │  
            ▼  
     Product Image  
            │  
            ▼  
           Unit

(Conceptually, `product` references `category`, `brand`, and `unit`; `product_image` references `product`.)

# Inventory

# **Responsibilities**

## **Owns**

* Current stock  
* Stock movement history

## **Does NOT Own**

* Products  
* Purchase Orders  
* Sales Invoices  
* Customers  
* Suppliers

---

# **Module Structure**

Inventory  
│  
├── inventory  
└── stock\_movement

Only **2 tables**.

---

# **Table 1 — inventory**

## **Classification**

Projection (Current State)

---

## **Purpose**

Stores the **current available stock** for each product.

This table exists only for fast reads.

The application never manually edits this table.

It is updated automatically whenever a stock movement occurs.

---

## **Business Rules**

* One inventory record per product.  
* Quantity cannot become negative (unless backorders are enabled in a future version).  
* Inventory is always synchronized with Stock Movement.  
* Products with zero quantity remain in inventory.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| product\_id | UUIDv7 | No | FK → product |
| quantity | DECIMAL(18,3) | No | Current Available Stock |
| reserved\_quantity | DECIMAL(18,3) | No | Default 0 |
| updated\_at | TIMESTAMPTZ | No | Last Inventory Update |

---

## **Constraints**

UNIQUE (business\_id, product\_id)  
---

## **Indexes**

PRIMARY KEY (id)

INDEX (business\_id)

INDEX (product\_id)

UNIQUE (business\_id, product\_id)  
---

## **Notes**

Available Stock

Available Stock \= Quantity \- Reserved Quantity

Although `reserved_quantity` will remain `0` in v1, keeping the column now avoids future schema changes if sales reservations or online orders are introduced.

---

# **Table 2 — stock\_movement**

## **Classification**

Ledger (Source of Truth)

---

## **Purpose**

Records **every inventory change**.

This is the **source of truth**.

Nothing changes stock without creating a Stock Movement.

---

## **Business Rules**

* Never update existing records.  
* Never delete records.  
* Every stock change creates exactly one movement.  
* Manual adjustments require a reason.  
* Inventory is updated only after a valid stock movement.

---

## **Movement Types**

OPENING\_STOCK

PURCHASE

SALE

SALE\_RETURN

PURCHASE\_RETURN

ADJUSTMENT

Simple and sufficient for v1.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| product\_id | UUIDv7 | No | FK → product |
| movement\_type | ENUM | No | Type of Stock Movement |
| quantity | DECIMAL(18,3) | No | Positive or Negative |
| reference\_type | VARCHAR(30) | Yes | Invoice, Purchase, etc. |
| reference\_id | UUIDv7 | Yes | Related Document |
| reason | TEXT | Yes | Required for ADJUSTMENT |
| created\_by | UUIDv7 | No | FK → user |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Example Records**

| Type | Quantity |
| ----- | ----- |
| Opening Stock | \+100 |
| Purchase | \+25 |
| Sale | \-5 |
| Sale Return | \+2 |
| Purchase Return | \-4 |
| Adjustment | \-1 |

---

## **Constraints**

If movement\_type \= ADJUSTMENT

↓

reason IS NOT NULL  
---

## **Indexes**

PRIMARY KEY (id)

INDEX (business\_id)

INDEX (product\_id)

INDEX (movement\_type)

INDEX (created\_at)  
---

# **Relationships**

Business  
   │  
   ▼  
Product  
   │  
   ├──────────────┐  
   │              │  
   ▼              ▼  
Inventory    Stock Movement  
---

# **Inventory Flow**

## **Purchase**

Purchase Created

↓

Stock Movement (+)

↓

Inventory Updated  
---

## **Sale**

Invoice Finalized

↓

Stock Movement (-)

↓

Inventory Updated  
---

## **Manual Adjustment**

Stock Adjustment

↓

Stock Movement (ADJUSTMENT)

↓

Inventory Updated  
---

# **Important Architecture Rule**

NO MODULE

↓

Updates inventory directly.

Instead

Purchase

↓

Stock Movement

↓

Inventory

or

Sale

↓

Stock Movement

↓

Inventory

Every inventory change flows through the same mechanism.

---

# Sales

# **Atlas Sales Module v1.0**

## **Purpose**

The Sales module manages all customer sales transactions.

It is responsible for:

* Creating invoices  
* Recording sold products  
* Recording customer payments  
* Tracking outstanding dues

It **does not** manage:

* Inventory  
* Accounting  
* Customer master

Those modules react to Sales.

---

# **Responsibilities**

### **Owns**

* Sales Invoice  
* Invoice Items  
* Customer Payments

### **Does NOT Own**

* Customer  
* Product  
* Inventory  
* Ledger

---

# **Module Structure**

Sales  
│  
├── invoice  
├── invoice\_item  
└── payment

Only **3 tables**.

---

# **1\. invoice**

## **Classification**

Transaction

---

## **Purpose**

Represents a customer invoice.

Both Sales and Returns are stored here.

No separate Sales Return table.

---

## **Business Rules**

* Invoice numbers must be unique per business.  
* Invoice cannot be edited after finalization.  
* Invoice cannot be deleted.  
* Returns use `invoice_type = RETURN`.  
* Invoice totals are calculated from invoice items.  
* `paid_amount` and `balance_amount` are maintained automatically.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | PK |
| business\_id | UUIDv7 | No | FK → business |
| customer\_id | UUIDv7 | Yes | FK → customer (walk-in customers allowed) |
| invoice\_number | VARCHAR(50) | No | Business Unique |
| invoice\_type | ENUM | No | SALE / RETURN |
| invoice\_date | TIMESTAMPTZ | No |  |
| subtotal | DECIMAL(18,2) | No | Before Discount & GST |
| discount\_amount | DECIMAL(18,2) | No | Default 0 |
| tax\_amount | DECIMAL(18,2) | No | GST Amount |
| total\_amount | DECIMAL(18,2) | No | Final Invoice Total |
| paid\_amount | DECIMAL(18,2) | No | Default 0 |
| balance\_amount | DECIMAL(18,2) | No |  |
| notes | TEXT | Yes |  |
| status | ENUM | No |  |
| created\_by | UUIDv7 | No | FK → user |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Invoice Type**

SALE

RETURN  
---

## **Status**

DRAFT

FINALIZED

PARTIALLY\_PAID

PAID

CANCELLED  
---

## **Constraints**

UNIQUE (business\_id, invoice\_number)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(customer\_id)

INDEX(invoice\_date)

INDEX(status)

INDEX(invoice\_type)  
---

# **2\. invoice\_item**

## **Classification**

Transaction

---

## **Purpose**

Stores all products sold on an invoice.

---

## **Business Rules**

* One invoice has many items.  
* Quantity cannot be zero.  
* Unit price is copied from Product at invoice creation.  
* Future product price changes do not affect historical invoices.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| invoice\_id | UUIDv7 | No |
| product\_id | UUIDv7 | No |
| quantity | DECIMAL(18,3) | No |
| unit\_price | DECIMAL(18,2) | No |
| discount\_amount | DECIMAL(18,2) | No |
| tax\_amount | DECIMAL(18,2) | No |
| line\_total | DECIMAL(18,2) | No |

---

## **Indexes**

PRIMARY KEY(id)

INDEX(invoice\_id)

INDEX(product\_id)  
---

# **3\. payment**

## **Classification**

Transaction

---

## **Purpose**

Represents money received against an invoice.

Supports:

* Full payment  
* Partial payment  
* Multiple payment methods  
* Multiple payments on different dates

---

## **Business Rules**

* One payment belongs to one invoice.  
* Multiple payments are allowed.  
* Payment updates invoice paid amount.  
* Payment updates invoice balance.  
* Payments are immutable after posting (reversals handled separately in the Ledger module if needed).

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| business\_id | UUIDv7 | No |
| invoice\_id | UUIDv7 | No |
| payment\_date | TIMESTAMPTZ | No |
| payment\_method | ENUM | No |
| amount | DECIMAL(18,2) | No |
| reference\_number | VARCHAR(100) | Yes |
| remarks | TEXT | Yes |
| received\_by | UUIDv7 | No |
| created\_at | TIMESTAMPTZ | No |

---

## **Payment Methods**

CASH

UPI

CARD

BANK\_TRANSFER

CHEQUE  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(invoice\_id)

INDEX(payment\_date)

INDEX(payment\_method)  
---

# **Relationships**

Business  
   │  
   ▼  
Invoice  
   │  
   ├──────────────┐  
   ▼              ▼  
Invoice Item    Payment  
   │  
   ▼  
Product  
---

# **Sales Workflow**

## **Sale**

Create Invoice  
       │  
       ▼  
Add Invoice Items  
       │  
       ▼  
Calculate GST  
       │  
       ▼  
Finalize Invoice  
       │  
       ├──────────────► Inventory  
       │                 Create Stock Movement (-)  
       │  
       └──────────────► Ledger  
                         Create Sales Entry  
---

## **Payment**

Receive Payment  
       │  
       ▼  
Create Payment  
       │  
       ▼  
Update Invoice

paid\_amount

balance\_amount

status  
       │  
       └──────────────► Ledger  
                         Create Receipt Entry  
---

## **Sales Return**

Create Invoice

invoice\_type \= RETURN  
       │  
       ▼  
Inventory

Stock Movement (+)  
       │  
       ▼  
Ledger

Reverse Revenue

# Purchasing

# **Proposed Module Structure**

Purchasing  
│  
├── purchase  
├── purchase\_item  
└── supplier\_payment

Only **3 tables**.

---

# **1\. purchase**

## **Classification**

Transaction

---

## **Purpose**

Represents a supplier purchase.

Both purchases and purchase returns are stored here.

---

## **Business Rules**

* Purchase number unique per business.  
* Cannot delete after finalization.  
* Purchase Return uses `purchase_type = RETURN`.  
* Totals calculated from purchase items.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| business\_id | UUIDv7 | No |
| supplier\_id | UUIDv7 | No |
| purchase\_number | VARCHAR(50) | No |
| purchase\_type | ENUM | No |
| purchase\_date | TIMESTAMPTZ | No |
| supplier\_invoice\_number | VARCHAR(100) | Yes |
| subtotal | DECIMAL(18,2) | No |
| discount\_amount | DECIMAL(18,2) | No |
| tax\_amount | DECIMAL(18,2) | No |
| total\_amount | DECIMAL(18,2) | No |
| paid\_amount | DECIMAL(18,2) | No |
| balance\_amount | DECIMAL(18,2) | No |
| notes | TEXT | Yes |
| status | ENUM | No |
| created\_by | UUIDv7 | No |
| created\_at | TIMESTAMPTZ | No |
| updated\_at | TIMESTAMPTZ | No |

---

## **Purchase Type**

PURCHASE

RETURN  
---

## **Status**

DRAFT

FINALIZED

PARTIALLY\_PAID

PAID

CANCELLED  
---

## **Constraints**

UNIQUE (business\_id, purchase\_number)  
---

# **2\. purchase\_item**

## **Purpose**

Stores purchased products.

---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| purchase\_id | UUIDv7 |
| product\_id | UUIDv7 |
| quantity | DECIMAL(18,3) |
| unit\_cost | DECIMAL(18,2) |
| discount\_amount | DECIMAL(18,2) |
| tax\_amount | DECIMAL(18,2) |
| line\_total | DECIMAL(18,2) |

Notice I intentionally used **`unit_cost`** instead of `purchase_price`.

This represents the **actual cost of that purchase**, preserving historical purchase prices even if the product's default cost changes later.

---

# **3\. supplier\_payment**

## **Purpose**

Represents money paid to suppliers.

Supports:

* Partial payments  
* Multiple payments  
* Multiple payment methods

---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| business\_id | UUIDv7 |
| purchase\_id | UUIDv7 |
| payment\_date | TIMESTAMPTZ |
| payment\_method | ENUM |
| amount | DECIMAL(18,2) |
| reference\_number | VARCHAR(100) |
| remarks | TEXT |
| paid\_by | UUIDv7 |
| created\_at | TIMESTAMPTZ |

---

## **Payment Methods**

CASH

UPI

CARD

BANK\_TRANSFER

CHEQUE

Exactly the same enum as Sales for consistency.

---

# **Relationships**

Business  
     │  
     ▼  
Purchase  
     │  
     ├──────────────┐  
     ▼              ▼  
Purchase Item   Supplier Payment  
     │  
     ▼  
  Product  
---

# **Purchase Workflow**

## **Purchase**

Create Purchase

↓

Add Products

↓

Finalize Purchase

↓

Inventory

Stock Movement (+)

↓

Ledger

Purchase Entry  
---

## **Purchase Return**

Create Purchase

purchase\_type \= RETURN

↓

Inventory

Stock Movement (-)

↓

Ledger

Reverse Purchase  
---

## **Supplier Payment**

Pay Supplier

↓

Supplier Payment

↓

Update Purchase

paid\_amount

balance\_amount

status

↓

Ledger

Payment Entry  
---

# **Future Features (Not in v1)**

* Purchase Orders  
* Goods Receipt Notes (GRN)  
* Supplier Quotations  
* Vendor Contracts  
* Lead Times  
* Supplier Rating  
* Approval Workflow  
* Multi-warehouse Receiving

# CRM

# **Module Structure**

CRM  
│  
└── party

Only **1 table**.

---

# **Party Types**

Instead of separate tables:

Customer

Supplier

Use

CUSTOMER

SUPPLIER

BOTH  
---

# **Table — party**

## **Classification**

Master

---

## **Purpose**

Represents any external business or person.

Examples

Walk-in Customer

ABC Traders

XYZ Suppliers

Reliance Retail  
---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | PK |
| business\_id | UUIDv7 | No | FK |
| party\_type | ENUM | No | CUSTOMER / SUPPLIER / BOTH |
| name | VARCHAR(200) | No |  |
| company\_name | VARCHAR(200) | Yes |  |
| mobile | VARCHAR(15) | Yes |  |
| email | VARCHAR(255) | Yes |  |
| gstin | VARCHAR(15) | Yes |  |
| pan | VARCHAR(10) | Yes |  |
| address\_line1 | VARCHAR(255) | Yes |  |
| address\_line2 | VARCHAR(255) | Yes |  |
| city | VARCHAR(100) | Yes |  |
| state | VARCHAR(100) | Yes |  |
| pincode | VARCHAR(10) | Yes |  |
| opening\_balance | DECIMAL(18,2) | No | Default 0 |
| notes | TEXT | Yes |  |
| status | ENUM | No | ACTIVE / INACTIVE |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

# **Party Type**

CUSTOMER

SUPPLIER

BOTH  
---

# **Status**

ACTIVE

INACTIVE  
---

# **Constraints**

UNIQUE (business\_id, mobile)  
WHERE mobile IS NOT NULL

UNIQUE (business\_id, gstin)  
WHERE gstin IS NOT NULL

Notice that **name is intentionally not unique** because many businesses can legitimately have the same name.

---

# **Relationships**

              Party  
             /     \\  
            /       \\  
           ▼         ▼  
      Sales      Purchasing  
        │             │  
    invoice      purchase  
---

# **Business Rules**

* A party can be a customer, supplier, or both.  
* Mobile and GSTIN are optional.  
* Walk-in customers are supported.  
* Parties are never deleted; they can be marked inactive.  
* Opening balance is entered only during creation. Subsequent balances come from Sales, Purchasing, and Ledger transactions.

# Ledger

# **Proposed Module Structure**

Ledger  
│  
├── ledger\_account  
├── journal\_entry  
├── journal\_line  
└── expense

Only **4 tables**.

---

# **1\. ledger\_account**

## **Classification**

Master

---

## **Purpose**

Chart of Accounts.

Examples

Cash

Bank

Sales

Purchase

GST Input

GST Output

Accounts Receivable

Accounts Payable

Office Expense  
---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| business\_id | UUIDv7 |
| account\_code | VARCHAR(20) |
| account\_name | VARCHAR(150) |
| account\_type | ENUM |
| parent\_account\_id | UUIDv7 |
| status | ENUM |
| created\_at | TIMESTAMPTZ |

---

## **Account Types**

ASSET

LIABILITY

EQUITY

INCOME

EXPENSE  
---

# **2\. journal\_entry**

## **Purpose**

Represents one accounting transaction.

Example

Sales Invoice

↓

Journal Entry  
---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| business\_id | UUIDv7 |
| entry\_number | VARCHAR(50) |
| reference\_type | VARCHAR(30) |
| reference\_id | UUIDv7 |
| entry\_date | TIMESTAMPTZ |
| description | TEXT |
| created\_by | UUIDv7 |
| created\_at | TIMESTAMPTZ |

---

# **3\. journal\_line**

## **Purpose**

Actual debit/credit lines.

---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| journal\_entry\_id | UUIDv7 |
| ledger\_account\_id | UUIDv7 |
| debit\_amount | DECIMAL(18,2) |
| credit\_amount | DECIMAL(18,2) |

---

## **Business Rule**

Sum(Debit)

\=

Sum(Credit)

Always.

---

# **4\. expense**

## **Purpose**

Simple expense entry screen.

Examples

Fuel

Electricity

Rent

Office Supplies

Atlas automatically generates

Journal Entry

↓

Journal Lines  
---

## **Schema**

| Column | Type |
| ----- | ----- |
| id | UUIDv7 |
| business\_id | UUIDv7 |
| expense\_date | TIMESTAMPTZ |
| ledger\_account\_id | UUIDv7 |
| amount | DECIMAL(18,2) |
| payment\_method | ENUM |
| remarks | TEXT |
| created\_by | UUIDv7 |
| created\_at | TIMESTAMPTZ |

---

# **Relationships**

Ledger Account  
       ▲  
       │  
Journal Line  
       ▲  
       │  
Journal Entry  
       ▲  
       │  
Expense

Sales and Purchasing don't write directly to ledger tables.

Instead:

Invoice Finalized  
       │  
       ▼  
Application Service  
       │  
       ▼  
Journal Entry  
       │  
       ▼  
Journal Lines  
---

# **One More Improvement**

I would **not** create tables like:

* tax\_transaction  
* expense\_category  
* cash\_register  
* financial\_period

for v1.

Why?

### **Expense Category**

Use:

ledger\_account

Example

Rent Expense

Fuel Expense

Electricity Expense

No separate category table needed.

---

### **Financial Period**

The financial year is already stored in:

business\_settings

Good enough.

---

### **Tax Transaction**

GST can be derived from journal entries and invoice data.

---

### **Cash Register**

Most Indian SMBs don't manage multiple cash drawers.

Can be added later.

---

# **Final Ledger Module**

Ledger  
│  
├── ledger\_account  
├── journal\_entry  
├── journal\_line  
└── expense

Only **4 tables**.

---

# **Why I Think This Is the Right Design**

This module gives Atlas:

* ✅ Proper double-entry accounting  
* ✅ Profit & Loss  
* ✅ Balance Sheet  
* ✅ Trial Balance  
* ✅ GST reporting foundation  
* ✅ Accounts Receivable  
* ✅ Accounts Payable  
* ✅ Simple expense entry

without introducing enterprise accounting complexity.

# Architectural Laws

**Each domain owns its tables exclusively.**  
**Domains never write directly to another domain's tables.**  
**Reads happen through services when business logic is involved.**  
**Writes happen through commands handled by the owning domain.**  
**Events notify other domains after successful changes.**  
**AI, Workflow, Notification, and Analytics are observers and orchestrators, not owners of core business data.**  
**The database implements the domain model—it does not define it.**  
**Operational tables are for transactions. Analytics tables are for questions.** 

Core Business Domains            
        │  
        ▼  
Security  
        │  
        ▼  
Workflow  
        │  
        ▼  
AI  
        │  
        ▼  
Notification  
        │  
        ▼  
Audit  
        │  
        ▼  
System  
        │  
        ▼  
Analytics  
        │  
        ▼  
Rules  
        │  
        ▼  
Cross-Domain Review  
        │  
        ▼  
Commands  
        │  
        ▼  
Services  
        │  
        ▼  
Events  
        │  
        ▼  
API Design  
        │  
        ▼  
AI Tool Registry

# Security

# **Atlas Security Domain v1.0**

## **Purpose**

The Security domain manages **authorization** within a business.

It answers one question:

**"Can this business member perform this action?"**

It **does not** authenticate users.

Authentication belongs to the **Identity** domain.

---

# **Responsibilities**

## **Owns**

* Roles  
* Permissions  
* Role Assignments  
* Permission Assignments

## **Does NOT Own**

* Users  
* Businesses  
* Business Members  
* Sessions  
* Authentication

---

# **Domain Structure**

Security  
│  
├── role  
├── permission  
├── role\_permission  
└── member\_role

Only **4 tables**.

---

# **Relationship Overview**

Business Member  
      │  
      ▼  
member\_role  
      │  
      ▼  
    Role  
      │  
      ▼  
role\_permission  
      │  
      ▼  
Permission

Notice:

* Users never receive roles directly.  
* Roles are assigned to **Business Members**.

This allows one user to have different roles in different businesses.

---

# **Table 1 — role**

## **Classification**

Master

---

## **Purpose**

Represents a collection of permissions.

Examples

* Owner  
* Manager  
* Accountant  
* Cashier  
* Staff

---

## **Business Rules**

* Role names must be unique within a business.  
* Businesses can create custom roles.  
* Roles cannot be deleted if assigned.  
* Default roles are created automatically.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| name | VARCHAR(100) | No |  |
| description | TEXT | Yes |  |
| is\_system | BOOLEAN | No | Default roles cannot be modified |
| status | ENUM | No | ACTIVE / INACTIVE |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Constraints**

UNIQUE (business\_id, name)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(status)  
---

# **Table 2 — permission**

## **Classification**

Reference

---

## **Purpose**

Represents one action that can be performed.

Permissions are global across Atlas.

Every business uses the same permission catalog.

---

## **Permission Naming Convention**

Use:

domain.action

Examples

sales.create\_invoice

sales.cancel\_invoice

sales.receive\_payment

inventory.adjust\_stock

catalog.create\_product

catalog.update\_product

crm.create\_party

ledger.create\_expense

This makes permissions predictable.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| code | VARCHAR(100) | No |
| name | VARCHAR(150) | No |
| description | TEXT | Yes |
| created\_at | TIMESTAMPTZ | No |

---

## **Constraints**

UNIQUE (code)  
---

## **Indexes**

PRIMARY KEY(id)

UNIQUE(code)  
---

# **Table 3 — role\_permission**

## **Classification**

Mapping

---

## **Purpose**

Assigns permissions to roles.

This is the core of RBAC.

---

## **Business Rules**

* One permission can belong to many roles.  
* One role has many permissions.  
* Duplicate assignments are not allowed.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| role\_id | UUIDv7 | No |
| permission\_id | UUIDv7 | No |
| created\_at | TIMESTAMPTZ | No |

---

## **Constraints**

UNIQUE (role\_id, permission\_id)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(role\_id)

INDEX(permission\_id)  
---

# **Table 4 — member\_role**

## **Classification**

Mapping

---

## **Purpose**

Assigns roles to Business Members.

Notice:

It does **not** assign roles directly to users.

---

## **Business Rules**

* A business member may have multiple roles.  
* A role may be assigned to many business members.  
* Duplicate assignments are not allowed.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| business\_member\_id | UUIDv7 | No |
| role\_id | UUIDv7 | No |
| assigned\_by | UUIDv7 | Yes |
| assigned\_at | TIMESTAMPTZ | No |

---

## **Constraints**

UNIQUE (business\_member\_id, role\_id)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_member\_id)

INDEX(role\_id)  
---

# **Authorization Flow**

User Login  
    │  
    ▼  
Identity  
    │  
    ▼  
Business Selected  
    │  
    ▼  
Business Member  
    │  
    ▼  
Assigned Roles  
    │  
    ▼  
Role Permissions  
    │  
    ▼  
Permission Granted?  
---

# **Example**

Rahul belongs to two businesses.

Rahul  
│  
├── ABC Traders  
│      │  
│      ▼  
│   Business Member  
│      │  
│      ▼  
│     Owner  
│  
└── XYZ Pharma  
      │  
      ▼  
  Business Member  
      │  
      ▼  
   Accountant

Same user.

Different permissions.

Exactly what we want.

---

# **Default System Roles**

Created automatically for every business:

Owner

Manager

Accountant

Cashier

Staff

Businesses can create additional custom roles if needed.

# System

# **Atlas System Domain v1.0**

## **Purpose**

The **System** domain provides the infrastructure that powers Atlas.

It is the foundation for:

* Event publishing  
* Background processing  
* Feature management  
* Global configuration

It **never contains business logic**.

It doesn't know what an Invoice, Product, Customer or Purchase is.

It only provides infrastructure services.

---

# **Responsibilities**

## **Owns**

* Domain Events  
* Event Outbox  
* Background Jobs  
* System Settings  
* Feature Flags

---

## **Does NOT Own**

* Users  
* Businesses  
* Products  
* Inventory  
* Sales  
* Purchasing  
* Ledger  
* CRM

---

# **Domain Structure**

System  
│  
├── event  
├── event\_outbox  
├── background\_job  
├── system\_setting  
└── feature\_flag

Total Tables: **5**

---

# **1\. event**

## **Classification**

Infrastructure

---

## **Purpose**

Stores every business event generated by Atlas.

These events become the communication mechanism between domains.

Examples

* Invoice Finalized  
* Payment Received  
* Product Created  
* Stock Changed  
* Expense Added

The Event table is **immutable**.

Events are never updated.

---

## **Business Rules**

* Events are append-only.  
* Events cannot be modified.  
* Events cannot be deleted.  
* Every business event generates exactly one event record.

---

## **Schema**

| Column | Type | Nullable | Notes |
| :---- | :---- | :---- | :---- |
| **id** | **UUIDv7** | **No** | **Primary Key** |
| **business\_id** | **UUIDv7** | **Yes** | **Nullable for system-wide events** |
| **event\_type** | **VARCHAR(100)** | **No** | **e.g.** invoice.finalized |
| **event\_version** | **SMALLINT** | **No** | **Contract version (Default 1\)** |
| **source\_domain** | **VARCHAR(50)** | **No** | **Originating module (e.g., sales)** |
| **aggregate\_type** | **VARCHAR(50)** | **No** | **invoice, product, purchase** |

## ---

## **Example Event Types**

invoice.created

invoice.finalized

payment.received

purchase.finalized

stock.changed

expense.created

party.created

product.updated  
---

## **Example Payload**

{  
 "invoice\_id": "...",  
 "party\_id": "...",  
 "total\_amount": 12500  
}  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(event\_type)

INDEX(aggregate\_type)

INDEX(aggregate\_id)

INDEX(occurred\_at)  
---

# **2\. event\_outbox**

## **Classification**

Infrastructure

---

## **Purpose**

Implements the **Transactional Outbox Pattern**.

Instead of publishing events immediately:

Save Invoice

↓

Commit Transaction

↓

Create Outbox Record

↓

Worker Processes

↓

Publish Event

This guarantees reliable event delivery.

---

## **Business Rules**

* Created inside the same transaction as the business event.  
* Processed asynchronously.  
* Supports retries.  
* Never loses events.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| event\_id | UUIDv7 | No |
| status | ENUM | No |
| retry\_count | INTEGER | No |
| last\_attempt\_at | TIMESTAMPTZ | Yes |
| processed\_at | TIMESTAMPTZ | Yes |
| created\_at | TIMESTAMPTZ | No |

---

## **Status**

PENDING

PROCESSING

COMPLETED

FAILED  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(status)

INDEX(created\_at)  
---

# **3\. background\_job**

## **Classification**

Infrastructure

---

## **Purpose**

Represents asynchronous work executed by Atlas.

Supports:

* One-time jobs  
* Delayed jobs  
* Scheduled jobs  
* Recurring jobs

This eliminates the need for a separate `cron_job` table.

---

## **Examples**

Generate Invoice PDF

Export Excel

Cleanup Expired OTP

Daily Sales Summary

Weekly Inventory Report

AI Context Refresh

WhatsApp Synchronization  
---

## **Business Rules**

* Jobs execute asynchronously.  
* Failed jobs may retry.  
* Recurring jobs automatically create their next execution.  
* Payload contains all execution parameters.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| job\_type | VARCHAR(100) | No |  |
| payload | JSONB | No | Job Parameters |
| status | ENUM | No |  |
| retry\_count | INTEGER | No | Default 0 |
| scheduled\_at | TIMESTAMPTZ | Yes | One-time execution |
| schedule\_expression | VARCHAR(100) | Yes | Cron expression |
| is\_recurring | BOOLEAN | No | Default FALSE |
| started\_at | TIMESTAMPTZ | Yes |  |
| completed\_at | TIMESTAMPTZ | Yes |  |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Status**

PENDING

RUNNING

COMPLETED

FAILED  
---

## **Examples**

### **One-time Job**

Generate PDF

is\_recurring \= FALSE

scheduled\_at \= 2026-07-01 14:00  
---

### **Daily Job**

Daily Sales Report

is\_recurring \= TRUE

schedule\_expression \= 0 23 \* \* \*  
---

### **Every 30 Minutes**

Cleanup OTP

is\_recurring \= TRUE

schedule\_expression \= \*/30 \* \* \* \*  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(status)

INDEX(job\_type)

INDEX(scheduled\_at)  
---

# **4\. system\_setting**

## **Classification**

Configuration

---

## **Purpose**

Stores global application configuration.

These settings apply to the entire Atlas platform.

They are **not business-specific**.

---

## **Examples**

Maintenance Mode

Maximum Login Attempts

Default OTP Length

Maximum Upload Size

JWT Expiry

Password Policy  
---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| key | VARCHAR(100) | No |
| value | TEXT | No |
| description | TEXT | Yes |
| updated\_at | TIMESTAMPTZ | No |

---

## **Constraints**

PRIMARY KEY(key)  
---

# **5\. feature\_flag**

## **Classification**

Configuration

---

## **Purpose**

Controls feature availability without deployment.

Allows safe rollout of new functionality.

---

## **Examples**

AI Enabled

WhatsApp Integration

Workflow Engine

Experimental Dashboard

Beta Inventory

OCR Import  
---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| feature\_name | VARCHAR(100) | No |
| is\_enabled | BOOLEAN | No |
| description | TEXT | Yes |
| created\_at | TIMESTAMPTZ | No |
| updated\_at | TIMESTAMPTZ | No |

---

## **Constraints**

UNIQUE(feature\_name)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(is\_enabled)  
---

# **Relationships**

                  Domain  
                     │  
                     ▼  
                 Event Created  
                     │  
                     ▼  
                   event  
                     │  
                     ▼  
               event\_outbox  
                     │  
         Background Worker  
                     │  
     ┌───────────────┼───────────────┐  
     ▼               ▼               ▼  
Workflow      Notification     Analytics  
                     │  
                     ▼  
               background\_job  
---

# **Event Flow**

## **Invoice Finalized**

Sales Domain  
     │  
     ▼  
Finalize Invoice  
     │  
     ▼  
Create Journal Entry  
     │  
     ▼  
Create Stock Movement  
     │  
     ▼  
Create Event  
     │  
     ▼  
Create Outbox Record  
     │  
     ▼  
Commit Transaction  
     │  
     ▼  
Worker Processes Outbox  
     │  
     ├────────────► Workflow  
     ├────────────► Notification  
     ├────────────► Analytics  
     └────────────► AI  
---

# **Design Decisions**

## **Why separate `event` and `event_outbox`?**

They represent different concerns.

**event**

Represents **what happened**.

**event\_outbox**

Represents **what still needs processing**.

Separating them provides a clean implementation of the Outbox Pattern.

---

## **Why no `cron_job` table?**

Recurring scheduling is simply a property of a background job.

Adding:

* `schedule_expression`  
* `is_recurring`

provides all required functionality while avoiding another infrastructure table.

---

## **Why no `failed_job` table?**

A failed job is simply:

status \= FAILED

inside `background_job`.

No additional table required.

---

## **Why no `job_execution` table?**

Atlas v1 doesn't need execution history beyond the timestamps stored on the job itself.

If detailed execution logs become necessary later, a dedicated `job_execution` table can be introduced without changing the existing design.

# Audit

# **Atlas Audit Domain v1.0**

## **Purpose**

The **Audit** domain records every important change made within Atlas.

It provides:

* Accountability  
* Change History  
* Security Monitoring  
* Troubleshooting  
* Compliance Support

The Audit domain is **read-only** from a business perspective.

It never changes business data.

It only records what happened.

---

# **Responsibilities**

## **Owns**

* Audit Logs  
* Security Events

---

## **Does NOT Own**

* Authentication  
* Authorization  
* Business Data  
* Inventory  
* Sales  
* Purchasing  
* Ledger

---

# **Domain Structure**

Audit  
│  
├── audit\_log  
└── security\_event

Total Tables: **2**

---

# **1\. audit\_log**

## **Classification**

Infrastructure

---

## **Purpose**

Records every important change made to business data.

Examples

* Product Created  
* Product Updated  
* Invoice Cancelled  
* Payment Received  
* Expense Added  
* Role Assigned

Every business domain writes audit records through a common Audit Service.

---

## **Business Rules**

* Audit logs are append-only.  
* Audit records cannot be modified.  
* Audit records cannot be deleted.  
* Only CREATE, UPDATE and DELETE operations are audited.  
* Read operations are not audited.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | Yes | Nullable for system operations |
| user\_id | UUIDv7 | Yes | Nullable for automated jobs |
| entity\_type | VARCHAR(50) | No | invoice, product, purchase |
| entity\_id | UUIDv7 | No | Related Entity |
| action | ENUM | No | CREATE / UPDATE / DELETE |
| before\_data | JSONB | Yes | Previous State |
| after\_data | JSONB | Yes | New State |
| ip\_address | INET | Yes |  |
| user\_agent | TEXT | Yes |  |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Action Enum**

CREATE

UPDATE

DELETE  
---

## **Examples**

### **Product Updated**

entity\_type

product

↓

action

UPDATE  
---

### **Invoice Created**

entity\_type

invoice

↓

action

CREATE  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(user\_id)

INDEX(entity\_type)

INDEX(entity\_id)

INDEX(created\_at)  
---

# **2\. security\_event**

## **Classification**

Infrastructure

---

## **Purpose**

Records security-related incidents.

Unlike audit logs, these are **not business operations**.

They represent authentication, authorization and security events.

---

## **Examples**

* Failed Login  
* OTP Failure  
* Session Revoked  
* Permission Denied  
* Account Locked  
* Suspicious Activity

---

## **Business Rules**

* Security events are append-only.  
* Security events cannot be modified.  
* Security events cannot be deleted.  
* Severity determines alerting behavior.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| user\_id | UUIDv7 | Yes | Nullable if user unknown |
| business\_id | UUIDv7 | Yes | Nullable |
| event\_type | VARCHAR(100) | No |  |
| severity | ENUM | No |  |
| ip\_address | INET | Yes |  |
| details | JSONB | Yes | Additional Information |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Severity Enum**

LOW

MEDIUM

HIGH

CRITICAL  
---

## **Example Events**

LOGIN\_FAILED

OTP\_FAILED

SESSION\_REVOKED

PERMISSION\_DENIED

ACCOUNT\_LOCKED

SUSPICIOUS\_ACTIVITY  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(user\_id)

INDEX(event\_type)

INDEX(severity)

INDEX(created\_at)  
---

# **Relationships**

                   All Domains  
                        │  
                        ▼  
                 Audit Service  
                 │           │  
                 ▼           ▼  
            audit\_log   security\_event

Notice that **no domain writes directly to the Audit tables**.

Instead:

Sales Domain  
     │  
     ▼  
Audit Service  
     │  
     ▼  
audit\_log

Likewise:

Identity  
     │  
     ▼  
Audit Service  
     │  
     ▼  
security\_event

This keeps auditing consistent across the platform.

---

# **Audit Flow**

## **Invoice Updated**

Update Invoice  
     │  
     ▼  
Sales Service  
     │  
     ▼  
Audit Service  
     │  
     ▼  
audit\_log  
---

## **Failed Login**

Wrong Password  
     │  
     ▼  
Identity Service  
     │  
     ▼  
Audit Service  
     │  
     ▼  
security\_event  
---

## **Permission Denied**

Permission Check Failed  
     │  
     ▼  
Security Service  
     │  
     ▼  
Audit Service  
     │  
     ▼  
security\_event  
---

# **Design Decisions**

## **Why only two tables?**

Audit should remain **passive**.

Its job is to observe the platform, not participate in it.

Two well-designed tables provide:

* Complete business history  
* Security incident tracking  
* Compliance support  
* Debugging information

without introducing unnecessary complexity.

---

## **Why store `before_data` and `after_data` as JSONB?**

Because every domain has a different schema.

Trying to normalize audit history would create dozens of additional tables.

JSONB allows Atlas to audit **every domain uniformly** while remaining flexible and efficient.

---

## **Why no `login_history` table?**

The `session` table in the **Identity** domain already captures login lifecycle information.

Creating another table would duplicate data.

Security incidents such as failed logins belong in `security_event`.

# Workflow

# **Atlas Workflow Domain v1.0**

## **Purpose**

The **Workflow** domain automates business processes across Atlas.

It listens to business events and executes predefined actions.

Examples:

* Send payment reminders  
* Notify on low stock  
* Generate AI summaries  
* Schedule follow-up tasks  
* Trigger background jobs

Workflow **does not** execute business logic directly.

It orchestrates existing Application Services.

---

# **Responsibilities**

## **Owns**

* Workflow Definitions  
* Workflow Actions  
* Workflow Execution History

---

## **Does NOT Own**

* Sales  
* Inventory  
* CRM  
* Ledger  
* Notifications  
* AI  
* Business Data

---

# **Domain Structure**

Workflow  
│  
├── workflow  
├── workflow\_action  
└── workflow\_execution

Total Tables: **3**

---

# **1\. workflow**

## **Classification**

Automation

---

## **Purpose**

Defines an automation rule.

A workflow listens for one business event.

If its condition evaluates to true,

it executes one or more actions.

---

## **Business Rules**

* One workflow listens to one trigger event.  
* Workflow may contain zero or more conditions.  
* Workflow may contain one or more actions.  
* Disabled workflows never execute.  
* Workflows are business-specific.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| name | VARCHAR(150) | No | Workflow Name |
| description | TEXT | Yes |  |
| trigger\_event | VARCHAR(100) | No | Event Name |
| condition | JSONB | Yes | Optional Condition |
| is\_enabled | BOOLEAN | No | Default TRUE |
| created\_by | UUIDv7 | No | FK → user |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Example Trigger Events**

invoice.finalized

payment.received

purchase.finalized

stock.changed

expense.created

party.created  
---

## **Example Condition**

{  
 "field": "total\_amount",  
 "operator": "\>",  
 "value": 50000  
}

Another example:

{  
 "field": "balance\_amount",  
 "operator": "\>",  
 "value": 0  
}  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(trigger\_event)

INDEX(is\_enabled)  
---

# **2\. workflow\_action**

## **Classification**

Automation

---

## **Purpose**

Defines actions executed by a workflow.

One workflow

↓

Many ordered actions.

---

## **Business Rules**

* Actions execute sequentially.  
* Order is defined by `action_order`.  
* Workflow engine invokes Application Commands.  
* Workflow never executes SQL directly.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| workflow\_id | UUIDv7 | No | FK → workflow |
| action\_order | SMALLINT | No | Execution Order |
| action\_type | VARCHAR(100) | No | Command Name |
| configuration | JSONB | Yes | Action Parameters |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Example Action Types**

SendNotification

CreateBackgroundJob

GenerateAISummary

CreateTask

RunWebhook

ScheduleReminder

Notice these are **commands**, not implementations.

---

## **Example Configuration**

{  
 "channel": "WHATSAPP",  
 "template": "payment\_reminder"  
}  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(workflow\_id)

INDEX(action\_order)  
---

# **3\. workflow\_execution**

## **Classification**

History

---

## **Purpose**

Stores workflow execution history.

Every workflow run creates one execution record.

---

## **Business Rules**

* Execution history is immutable.  
* Failed executions retain error information.  
* Completed executions are never modified.  
* Workflow execution never changes business data directly.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| workflow\_id | UUIDv7 | No | FK → workflow |
| event\_id | UUIDv7 | No | FK → event |
| status | ENUM | No |  |
| started\_at | TIMESTAMPTZ | No |  |
| completed\_at | TIMESTAMPTZ | Yes |  |
| error\_message | TEXT | Yes | Failure Reason |

---

## **Status**

RUNNING

COMPLETED

FAILED  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(workflow\_id)

INDEX(event\_id)

INDEX(status)

INDEX(started\_at)  
---

# **Relationships**

               event  
                 │  
                 ▼  
            workflow  
                 │  
                 ▼  
        workflow\_action  
                 │  
                 ▼  
     workflow\_execution

Workflow reacts to **events** from the System domain.

It never polls business tables.

---

# **Workflow Execution Flow**

## **Example 1 – Large Invoice Alert**

Invoice Finalized  
       │  
       ▼  
event  
       │  
       ▼  
Find Matching Workflow  
       │  
       ▼  
Evaluate Condition

Invoice \> ₹50,000  
       │  
       ▼  
Execute Action 1

Send Notification  
       │  
       ▼  
Execute Action 2

Generate AI Summary  
       │  
       ▼  
Record Execution  
---

## **Example 2 – Low Stock Alert**

stock.changed  
       │  
       ▼  
Condition

Quantity \< Minimum Stock  
       │  
       ▼  
Schedule Reminder  
       │  
       ▼  
Notify Owner  
       │  
       ▼  
Execution Complete  
---

# **Design Decisions**

## **Why no `trigger` table?**

A workflow has exactly one trigger.

Storing it in the workflow table keeps the model simpler.

---

## **Why no `condition` table?**

Conditions are flexible by nature.

JSON allows future expansion without schema changes.

---

## **Why no `execution_step` table?**

Atlas workflows are intentionally sequential in v1.

Detailed step tracking adds complexity with limited value for SMBs.

If advanced debugging becomes necessary in the future, it can be introduced without redesigning the existing model.

---

## **Why actions invoke commands instead of SQL?**

Workflow is an orchestrator.

Example:

Workflow

↓

Receive Event

↓

Invoke Command

↓

Application Service

↓

Business Domain

↓

Database

This guarantees:

* Business rules are enforced.  
* Permissions are respected.  
* Audit logs are created.  
* Events are published correctly.

---

# **Future Extensions (Not in v1)**

Deferred until customer demand:

* Workflow Versioning  
* Nested Workflows  
* Parallel Actions  
* Branching Logic  
* Delays & Wait Timers  
* Visual Workflow Designer  
* Reusable Workflow Templates  
* Conditional Groups  
* Human Approval Steps

# Notifications

# **Atlas Notification Domain v1.0**

## **Purpose**

The **Notification** domain is responsible for delivering messages.

It does **not** decide **when** to send notifications.

It only decides **how** to send them.

Workflow, AI, or Business Domains create notification requests.

Notification delivers them.

---

# **Responsibilities**

## **Owns**

* Notification Requests  
* Notification Templates  
* Delivery History

---

## **Does NOT Own**

* Workflow Logic  
* Business Rules  
* Contacts  
* WhatsApp APIs  
* SMS Providers  
* Email Providers

---

# **Domain Structure**

Notification  
│  
├── notification  
├── notification\_template  
└── notification\_delivery

Total Tables: **3**

---

# **1\. notification**

## **Classification**

Communication

---

## **Purpose**

Represents a notification request.

It does not care whether the notification becomes:

* WhatsApp  
* SMS  
* Email

It simply represents

"Someone should receive this notification."

---

## **Business Rules**

* One notification can have multiple delivery attempts.  
* Notification content is immutable after creation.  
* Templates are optional.  
* Recipient information is resolved during delivery.  
* Notification never stores phone numbers or email addresses.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | Yes | Nullable for system notifications |
| recipient\_type | VARCHAR(30) | No | PARTY, USER, BUSINESS\_MEMBER |
| recipient\_id | UUIDv7 | No | Recipient Reference |
| template\_id | UUIDv7 | Yes | Nullable |
| title | VARCHAR(200) | Yes |  |
| message | TEXT | No | Final Notification Content |
| status | ENUM | No |  |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Recipient Types**

PARTY

USER

BUSINESS\_MEMBER  
---

## **Status**

PENDING

SENT

FAILED  
---

## **Example**

Workflow

↓

Create Notification

↓

Recipient

PARTY

↓

UUID

↓

Message

"Your payment is overdue."  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(recipient\_type)

INDEX(recipient\_id)

INDEX(status)

INDEX(created\_at)  
---

# **2\. notification\_template**

## **Classification**

Configuration

---

## **Purpose**

Reusable notification templates.

Templates avoid repeating message content.

They are optional.

Simple notifications may directly provide a message.

---

## **Business Rules**

* Templates are business-specific.  
* Templates support placeholders.  
* Templates never store recipient information.

---

## **Schema**

| Column | Type | Nullable |
| ----- | ----- | ----- |
| id | UUIDv7 | No |
| business\_id | UUIDv7 | No |
| name | VARCHAR(150) | No |
| channel | ENUM | No |
| subject | VARCHAR(200) | Yes |
| body | TEXT | No |
| created\_at | TIMESTAMPTZ | No |
| updated\_at | TIMESTAMPTZ | No |

---

## **Supported Channels**

Atlas v1 officially supports

WHATSAPP

SMS

EMAIL

Nothing else.

---

## **Example Template**

Payment Reminder

Hello {{customer\_name}}

Your invoice {{invoice\_number}}

for ₹{{amount}}

is overdue.  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(channel)  
---

# **3\. notification\_delivery**

## **Classification**

History

---

## **Purpose**

Tracks every delivery attempt.

One notification

↓

Many delivery attempts.

Supports retries.

---

## **Business Rules**

* Every attempt creates a record.  
* Failed attempts remain in history.  
* Delivery history is immutable.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| notification\_id | UUIDv7 | No | FK → notification |
| channel | ENUM | No |  |
| status | ENUM | No |  |
| provider\_reference | VARCHAR(150) | Yes | External Provider ID |
| error\_message | TEXT | Yes |  |
| attempted\_at | TIMESTAMPTZ | No |  |

---

## **Status**

PENDING

SUCCESS

FAILED  
---

## **Example**

Notification

↓

WhatsApp

↓

FAILED

↓

Retry

↓

SUCCESS

---

## **Indexes**

PRIMARY KEY(id)

INDEX(notification\_id)

INDEX(channel)

INDEX(status)

INDEX(attempted\_at)  
---

# **Relationships**

Workflow  
     │  
     ▼  
Notification Created  
     │  
     ▼  
notification  
     │  
     ├─────────────┐  
     ▼             ▼  
Template      Delivery History  
---

# **Notification Flow**

## **Invoice Due Reminder**

Workflow

↓

Create Notification

↓

Notification Service

↓

Resolve Recipient

↓

Read Latest Mobile Number

↓

Select Channel

↓

Background Job

↓

WhatsApp Provider

↓

Delivery Recorded

Notice

Notification never stores

Phone Number

Email

Instead

Recipient ID

↓

CRM

↓

Latest Contact Information

Always current.

---

# **Design Decisions**

## **Why no provider column?**

Provider selection is infrastructure.

It belongs in

System Settings

Example

WhatsApp Provider

↓

MSG91

SMS Provider

↓

MSG91

Email Provider

↓

SMTP

If a provider changes,

only System Settings change.

Nothing else.

---

## **Why no notification\_channel table?**

Channels are fixed.

Atlas v1 supports only

WHATSAPP

SMS

EMAIL

A separate table adds unnecessary complexity.

---

## **Why templates are optional?**

Some notifications are dynamic.

Example

AI Summary

↓

Generated on demand

No template required.

Other notifications

Payment Reminder

OTP

Welcome Message

benefit from templates.

---

## **Why recipient\_id instead of phone number?**

Because customer information changes.

Notification always retrieves the latest contact details from the CRM domain at send time.

No duplicate data.

No stale phone numbers.

---

# **Future Extensions (Not in v1)**

Deferred until customer demand:

* Push Notifications  
* Telegram  
* Slack  
* Microsoft Teams  
* Delivery Scheduling  
* Read Receipts  
* Notification Preferences  
* Broadcast Campaigns  
* Attachments  
* Rich Media Templates

# Atlas Analytics Domain

# Analytics

# **Atlas Analytics Domain v1.1 (Locked)**

## **Purpose**

The Analytics domain maintains **precomputed business intelligence snapshots**.

It is **not** the source of truth.

It provides optimized data for:

* Dashboard  
* AI  
* Reports  
* Mobile  
* Future Forecasting

---

# **Responsibilities**

## **Owns**

* Snapshot Types  
* Current Snapshots  
* Historical Snapshots

---

## **Does NOT Own**

* Business Transactions  
* Reports  
* AI  
* Sales  
* Inventory  
* Ledger

---

# **Domain Structure**

Analytics  
│  
├── analytics\_snapshot\_type  
├── analytics\_snapshot  
└── analytics\_history

Total Tables: **3**

---

# **1\. analytics\_snapshot\_type**

## **Classification**

Reference

---

## **Purpose**

Defines every supported business snapshot.

Instead of hardcoded enums, Atlas becomes configurable.

---

## **Business Rules**

* Snapshot codes are unique.  
* Snapshot types are global.  
* Snapshot types are rarely modified.  
* Snapshot types may be disabled.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| code | VARCHAR(100) | No | Unique Code |
| name | VARCHAR(150) | No | Display Name |
| description | TEXT | Yes |  |
| refresh\_strategy | ENUM | No | EVENT / SCHEDULE |
| is\_active | BOOLEAN | No | Default TRUE |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Refresh Strategies**

EVENT

SCHEDULE  
---

## **Example Records**

| Code |
| ----- |
| BUSINESS\_SUMMARY |
| SALES\_SUMMARY |
| PURCHASE\_SUMMARY |
| INVENTORY\_SUMMARY |
| FINANCIAL\_SUMMARY |
| CRM\_SUMMARY |

---

## **Constraints**

UNIQUE(code)  
---

## **Indexes**

PRIMARY KEY(id)

UNIQUE(code)

INDEX(is\_active)  
---

# **2\. analytics\_snapshot**

## **Classification**

Business Intelligence

---

## **Purpose**

Stores the **latest business intelligence snapshot**.

One business

↓

One snapshot type

↓

One JSON document

---

## **Business Rules**

* One active snapshot per Business \+ Snapshot Type.  
* Snapshot is overwritten whenever recalculated.  
* Snapshot is derived data.  
* Snapshot can always be rebuilt.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| snapshot\_type\_id | UUIDv7 | No | FK → analytics\_snapshot\_type |
| version | SMALLINT | No | JSON Schema Version |
| data | JSONB | No | Snapshot Document |
| checksum | VARCHAR(64) | Yes | Detects duplicate updates |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Constraints**

UNIQUE(  
business\_id,  
snapshot\_type\_id  
)  
---

## **Indexes**

PRIMARY KEY(id)

UNIQUE(  
business\_id,  
snapshot\_type\_id  
)

GIN(data)

INDEX(updated\_at)  
---

# **Example**

Business Summary

{  
 "today": {  
   "sales": 245000,  
   "purchase": 112000,  
   "profit": 58000  
 },

 "cash\_balance": 87000,

 "receivable": 325000,

 "payable": 195000,

 "low\_stock\_products": 14,

 "pending\_invoices": 9,

 "top\_product": "Paracetamol 500mg"  
}  
---

# **Why checksum?**

Suppose 10 invoice events happen.

Analytics Builder calculates.

Result hasn't changed.

Checksum matches.

Skip database update.

Small optimization.

Very useful later.

---

# **3\. analytics\_history**

## **Classification**

Business Intelligence

---

## **Purpose**

Stores historical business snapshots.

Supports:

* Trends  
* Charts  
* AI Comparisons  
* Forecasting

History is append-only.

---

## **Business Rules**

* One snapshot per period.  
* Never updated.  
* Never deleted.  
* Generated automatically.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| snapshot\_type\_id | UUIDv7 | No | FK → analytics\_snapshot\_type |
| period\_type | ENUM | No |  |
| period\_start | DATE | No |  |
| period\_end | DATE | No |  |
| version | SMALLINT | No |  |
| data | JSONB | No | Historical Snapshot |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Period Types**

DAILY

WEEKLY

MONTHLY

YEARLY  
---

## **Constraints**

UNIQUE(  
business\_id,  
snapshot\_type\_id,  
period\_type,  
period\_start  
)  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(snapshot\_type\_id)

INDEX(period\_type)

INDEX(period\_start)

GIN(data)  
---

# **Analytics Builder (Service)**

**Not a table.**

---

## **Responsibilities**

Listen to Events

↓

Determine affected snapshots

↓

Recalculate snapshot

↓

Compare checksum

↓

If changed

↓

Update analytics\_snapshot

↓

Archive daily snapshot

↓

analytics\_history  
---

# **Event Flow**

Invoice Finalized

Sales Domain

↓

Event

invoice.finalized

↓

Analytics Builder

↓

BUSINESS\_SUMMARY

↓

SALES\_SUMMARY

↓

analytics\_snapshot

Inventory remains untouched.

---

# **Snapshot Flow**

Business Domains  
       │  
       ▼  
  Domain Events  
       │  
       ▼  
Analytics Builder  
       │  
       ▼  
analytics\_snapshot  
       │  
       ├──────────────┬──────────────┬─────────────┐  
       ▼              ▼              ▼             ▼  
Dashboard          AI            Reports       Mobile  
---

# **AI Flow**

Owner asks

"How is my business doing today?"

AI executes

SELECT data

FROM analytics\_snapshot

WHERE business\_id \= ?

AND snapshot\_type \= BUSINESS\_SUMMARY;

One query.

Milliseconds.

---

# **Dashboard**

Dashboard also executes

SELECT data

FROM analytics\_snapshot

WHERE business\_id \= ?

AND snapshot\_type \= BUSINESS\_SUMMARY;

Same snapshot.

No duplicated calculations.

---

# **Design Decisions**

## **Why Snapshot Type table instead of Enum?**

Because business intelligence evolves.

Tomorrow we may add:

GST\_SUMMARY

CASHFLOW\_SUMMARY

AI\_SUMMARY

PURCHASE\_TREND

No database migration.

Just insert a row.

---

## **Why JSONB?**

Analytics is **derived**, not transactional.

Metrics change frequently.

JSON avoids schema migrations while keeping snapshots compact and AI-friendly.

---

## **Why History?**

Current snapshot answers:

What is happening now?

History answers:

What happened over time?

Both are needed.

---

## **Why Checksum?**

Avoids unnecessary writes.

Makes event storms inexpensive.

---

# **Future Extensions (Not in v1)**

* Hourly Snapshots  
* Forecast Snapshots  
* AI Generated Insights  
* Industry Benchmarks  
* Custom KPI Snapshots  
* Snapshot Compression  
* Snapshot Retention Policies

# AI

# **Atlas AI Domain v1.1 (Locked)**

## **Purpose**

The AI domain provides a conversational interface for Atlas.

It stores:

* Conversations  
* Messages  
* Persistent AI Memory

Everything else (business data, analytics, rules, tools) lives outside the AI domain.

---

# **Responsibilities**

## **Owns**

* Conversations  
* Messages  
* AI Memory

---

## **Consumes**

* Analytics  
* Business Services  
* Workflow  
* Notification  
* Audit

---

## **Does NOT Own**

* Business Data  
* Inventory  
* Sales  
* Ledger  
* Reports  
* Prompt Templates  
* Embeddings  
* Tool Registry

---

# **Domain Structure**

AI  
│  
├── conversation  
├── message  
└── ai\_memory

Total Tables: **3**

---

# **AI Architecture**

                User  
                  │  
                  ▼  
           conversation  
                  │  
                  ▼  
              message  
                  │  
                  ▼  
             AI Service  
       ┌──────────┼───────────┐  
       ▼          ▼           ▼  
Analytics    Business APIs   AI Memory  
---

# **1\. conversation**

## **Classification**

Communication

---

## **Purpose**

Represents one AI chat session.

Each conversation belongs to:

* One Business  
* One User

---

## **Business Rules**

* One conversation contains many messages.  
* Conversations never contain business data.  
* Conversations may be archived.  
* Users may create unlimited conversations.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| user\_id | UUIDv7 | No | FK → user |
| title | VARCHAR(200) | Yes | AI-generated or custom |
| status | ENUM | No | ACTIVE / ARCHIVED |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Status**

ACTIVE

ARCHIVED  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(user\_id)

INDEX(updated\_at)  
---

# **2\. message**

## **Classification**

Communication

---

## **Purpose**

Stores conversation history.

Supports:

* User messages  
* AI replies  
* System messages

---

## **Business Rules**

* Messages are immutable.  
* Messages belong to one conversation.  
* Ordered by creation time.  
* AI responses may reference executed commands.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| conversation\_id | UUIDv7 | No | FK → conversation |
| role | ENUM | No | USER / ASSISTANT / SYSTEM |
| content | TEXT | No |  |
| metadata | JSONB | Yes | AI metadata |
| created\_at | TIMESTAMPTZ | No |  |

---

## **Roles**

USER

ASSISTANT

SYSTEM  
---

## **Example Metadata**

{  
 "model":"gpt-5.5",  
 "tokens":1450,  
 "latency\_ms":920,  
 "tool\_calls":2,  
 "analytics\_used":\[  
   "BUSINESS\_SUMMARY",  
   "FINANCIAL\_SUMMARY"  
 \]  
}  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(conversation\_id)

INDEX(created\_at)

GIN(metadata)  
---

# **3\. ai\_memory**

## **Classification**

AI

---

## **Purpose**

Stores persistent AI memory.

This is **not business data**.

It stores only information AI should remember.

Examples

* Preferred language  
* Preferred report style  
* User preferences  
* Conversation summaries  
* Long-term facts

Business facts remain in Analytics.

---

## **Business Rules**

* Memory belongs to one Business.  
* User memory is optional.  
* Memory can expire.  
* Memory is updated only by AI Service.  
* Business facts are never duplicated here.

---

## **Schema**

| Column | Type | Nullable | Notes |
| ----- | ----- | ----- | ----- |
| id | UUIDv7 | No | Primary Key |
| business\_id | UUIDv7 | No | FK → business |
| user\_id | UUIDv7 | Yes | Nullable |
| conversation\_id | UUIDv7 | Yes | Nullable |
| namespace | VARCHAR(100) | No | Memory Category |
| memory\_key | VARCHAR(100) | No | Unique Key |
| scope | ENUM | No | BUSINESS / USER / CONVERSATION |
| data | JSONB | No | Memory Content |
| importance | SMALLINT | No | 1–10 |
| expires\_at | TIMESTAMPTZ | Yes | Optional |
| last\_accessed\_at | TIMESTAMPTZ | Yes |  |
| created\_at | TIMESTAMPTZ | No |  |
| updated\_at | TIMESTAMPTZ | No |  |

---

## **Scope**

BUSINESS

USER

CONVERSATION  
---

## **Example Namespaces**

business.preferences

business.communication

user.preferences

user.language

conversation.summary

conversation.followup  
---

## **Example**

### **Business Preference**

{  
 "currency":"INR",  
 "language":"English",  
 "timezone":"Asia/Kolkata"  
}  
---

### **User Preference**

{  
 "prefers\_short\_answers":true,  
 "show\_graphs":false,  
 "compare\_last\_month":true  
}  
---

### **Conversation Summary**

{  
 "summary":"Discussed GST filing for June.",  
 "follow\_up":"Show filing status next week."  
}  
---

## **Constraints**

Business-wide memory

UNIQUE (  
business\_id,  
namespace,  
memory\_key  
)  
WHERE user\_id IS NULL  
AND conversation\_id IS NULL  
---

User-specific memory

UNIQUE (  
business\_id,  
user\_id,  
namespace,  
memory\_key  
)  
WHERE user\_id IS NOT NULL  
---

Conversation memory

UNIQUE (  
conversation\_id,  
namespace,  
memory\_key  
)  
WHERE conversation\_id IS NOT NULL  
---

## **Indexes**

PRIMARY KEY(id)

INDEX(business\_id)

INDEX(user\_id)

INDEX(conversation\_id)

INDEX(namespace)

INDEX(scope)

INDEX(expires\_at)

GIN(data)  
---

# **AI Request Flow**

User Question  
      │  
      ▼  
Conversation  
      │  
      ▼  
Recent Messages  
      │  
      ▼  
AI Memory  
      │  
      ▼  
Analytics Snapshot  
      │  
      ▼  
Business Services  
      │  
      ▼  
LLM  
      │  
      ▼  
Store Response  
---

# **Memory Flow**

User says

"I always want concise reports."

       │  
       ▼

AI extracts preference

       │  
       ▼

ai\_memory

namespace

user.preferences

↓

memory\_key

response\_style

↓

{  
  "value":"concise"  
}

Future conversations automatically use that preference.

---

# **Design Decisions**

## **Why Namespace?**

Instead of creating many tables:

user\_preferences

business\_preferences

conversation\_memory

...

Everything stays inside one table.

Namespaces organize memory naturally.

---

## **Why Scope?**

Scope determines who owns the memory.

BUSINESS

↓

Shared across all users

USER

↓

Personal preference

CONVERSATION

↓

Specific chat only  
---

## **Why JSONB?**

Memory structure constantly evolves.

JSONB avoids schema migrations.

---

## **Why no embeddings?**

Embeddings are unnecessary for Atlas v1.

When semantic retrieval becomes necessary:

PostgreSQL

\+

pgvector

can be added without changing this schema.

---

## **Why no prompt\_template table?**

Prompts belong in code.

Version control is far superior to storing prompts in the database.

---

## **Why no tool\_execution table?**

Tool execution is already captured by:

* Audit  
* System Events  
* Message Metadata

No duplicate persistence is needed.

---

# **Future Extensions (Not in v1)**

* pgvector  
* Document Knowledge Base  
* Semantic Memory Retrieval  
* Long-term Conversation Summarization  
* Voice Chat  
* Image Understanding  
* Multi-Agent AI  
* Document Embeddings

# Trigger

---

# **What we've completed ✅**

✓ Modules  
✓ Tables  
✓ Columns  
✓ Relationships  
✓ Ownership  
✓ Constraints  
✓ Indexes

That's the **logical schema**.

---

# **What we haven't designed ❌**

This is the part many architects skip.

Database Architecture  
│  
├── Row Level Security (RLS)  
├── Database Roles  
├── Triggers  
├── Stored Procedures  
├── Event Publishing  
├── Transactions  
├── Soft Delete Strategy  
├── Partitioning  
├── Backup Strategy  
├── Multi-tenancy  
├── Performance Strategy  
└── Migration Strategy

This is what makes software production-ready.

---

# **1\. Row Level Security (Very Important)**

Since Atlas is multi-tenant:

Business A

Business B

Business C

One business should **never** see another business's data.

We need to decide:

* Which tables use RLS?  
* Which service role bypasses RLS?  
* How `business_id` is propagated?  
* How background workers access data?  
* How AI accesses business data?

This deserves its own design session.

---

# **2\. Event Architecture**

We've mentioned events many times.

Example:

Invoice Finalized

↓

Event

↓

Analytics

↓

Workflow

↓

Notification

↓

Audit

But we never formally defined:

Event Catalog

invoice.created

invoice.updated

invoice.finalized

payment.received

stock.changed

...

Nor:

* Event payload format  
* Versioning  
* Idempotency  
* Retry strategy

---

# **3\. Database Triggers**

This is a big one.

I actually **don't want many triggers**.

I recommend:

Business Logic

❌ NOT in database triggers

✅ In Application Services

Example:

Bad

AFTER INSERT invoice

↓

Update Inventory

Good

Invoice Service

↓

Update Inventory

↓

Create Ledger Entry

↓

Publish Event

↓

Commit

Much easier to debug and test.

---

# **The only triggers I'd keep**

Very few.

For example:

updated\_at

↓

Automatically update timestamp

Or maybe:

Audit helper

↓

Very lightweight

Nothing else.

---

# **4\. Outbox Pattern**

We designed the tables.

But we haven't designed:

Invoice Created

↓

Transaction

↓

Invoice

\+

Outbox Event

↓

Commit

↓

Worker

↓

Publish

That's another architecture document.

---

# **5\. Transaction Strategy**

This is extremely important.

Example

Create Invoice

Should be

Transaction

↓

Invoice

↓

Inventory Movement

↓

Ledger Entry

↓

Audit

↓

Outbox Event

↓

Commit

All or nothing.

We haven't formally defined that.

---

# **6\. Security Architecture**

We've created:

Identity

Security

But not:

* JWT Strategy  
* Refresh Tokens  
* Session Rotation  
* Device Trust  
* API Authentication  
* Rate Limiting  
* Permission Evaluation Flow

---

# **7\. Application Architecture**

Still missing.

Example:

Controller

↓

Application Service

↓

Domain Service

↓

Repository

↓

Database

---

# **Recommended Roadmap**

I think this should be our next sequence:

Phase 2

Database Architecture  
────────────────────────  
1\. Multi-tenancy & RLS  
2\. Transaction Strategy  
3\. Event Architecture  
4\. Trigger Strategy  
5\. Database Performance  
6\. Migration Strategy

↓

Phase 3

Application Architecture

↓

Phase 4

NestJS Implementation

---

# **to change**

Earlier I suggested moving directly to the Application Architecture.

I actually think **Database Architecture should come first**.

Because many Application Architecture decisions depend on:

* RLS  
* Transactions  
* Events  
* Trigger Strategy

---

## **recommendation**

1\. Multi-tenancy & Row-Level Security (RLS)  
2\. Transaction & Unit of Work Strategy  
3\. Event & Outbox Architecture  
4\. Database Trigger Policy  
5\. Soft Delete & Data Lifecycle  
6\. Performance (Indexes, Partitioning, JSONB, Caching)  
7\. Application Architecture

# Database Architecture v1.0

## **Chapter 1 — Multi-Tenant Architecture**

Defines:

* tenant model  
* business selection  
* tenant context propagation  
* service roles  
* AI access  
* background workers  
* cross-business isolation

Everything else depends on this.

---

## **Chapter 2 — Row Level Security (RLS)**

Defines:

* tables protected by RLS  
* tables exempt from RLS  
* policies  
* helper functions  
* session variables  
* service-role bypass  
* performance considerations

---

## **Chapter 3 — Transaction & Unit of Work**

Defines:

* transaction boundaries  
* ACID guarantees  
* cross-domain writes  
* optimistic concurrency  
* rollback rules

---

## **Chapter 4 — Event & Outbox Architecture**

Defines:

* canonical event format  
* event catalog  
* versioning  
* correlation IDs  
* causation IDs  
* retry strategy  
* idempotency  
* dead-letter handling

---

## **Chapter 5 — Database Trigger Policy**

Defines exactly what PostgreSQL is allowed to automate.

This should remain intentionally minimal.

---

## **Chapter 6 — Data Lifecycle**

Defines:

* soft delete policy  
* immutable tables  
* archival  
* retention  
* cleanup workers  
* attachments  
* backups

---

## **Chapter 7 — Performance Architecture**

Defines:

* indexing strategy  
* JSONB usage  
* GIN indexes  
* partitioning  
* connection pooling  
* caching  
* query guidelines

---

## **Chapter 8 — Migration & Operational Strategy**

Defines:

* Prisma migrations  
* seed data  
* deployment  
* rollback  
* feature flags  
* schema evolution

# Chapter 1 — Multi-Tenant Architecture

## **Objective**

Answer one question:

**How does every request in Atlas know which business it belongs to, while guaranteeing that no business can ever access another business's data?**

This affects every domain in the system.

# **Step 1 — Define the Tenant**

From the schema, the answer is already implicit.

The tenant is **Business**.

User  
│  
├────────────┐  
│            │  
▼            ▼  
Business A   Business B  
│            │  
Owner        Accountant

A user is **not** a tenant.

A tenant is a **Business**.

That aligns perfectly with your `business_member` table.

So our first architectural law becomes:

---

## **MT-001 — Business is the Tenant Boundary**

Every business-owned record belongs to exactly one `business`.

This extends your existing invariant:

Every business-owned record belongs to exactly one Business.

Now it becomes the security boundary as well.

---

# **Step 2 — User Authentication vs Business Context**

These are different things.

Authentication answers:

Who are you?

Business context answers:

Which business are you currently operating?

Example:

Rahul

↓

Login

↓

JWT

↓

Businesses

ABC Traders  
XYZ Pharma

↓

Select ABC Traders

↓

Everything now operates inside ABC Traders

This is extremely important.

The authenticated user may belong to:

* 1 business  
* 5 businesses  
* 100 businesses

The API must know which one is active.

---

## **MT-002 — Authentication Never Implies Tenant**

Logging in **does not** select a business.

Business selection is a separate step.

This makes multi-business support clean.

---

# **Step 3 — Active Business**

Once the user selects:

ABC Traders

every request carries

business\_id

internally.

Not because the frontend sends it everywhere blindly.

Because the backend establishes it as part of the request context.

Conceptually:

Request

↓

JWT

↓

user\_id

↓

Business Membership Check

↓

active\_business\_id

↓

Request Context

↓

Application Services

After this point:

No controller

No repository

No service

asks

Which business?

It already knows.

---

## **MT-003 — Every Request Has Exactly One Active Business**

Every authenticated request operates inside one and only one business context.

This dramatically simplifies every service.

---

# **Step 4 — Why This Design?**

Let's test it against the schema.

### **Sales**

Create Invoice

Needs:

business\_id

already available.

---

### **Inventory**

Adjust Stock

Needs

business\_id

already available.

---

### **CRM**

Create Party

Same.

---

### **AI**

Conversation

Already linked to

business\_id

No changes.

---

### **Workflow**

Business-specific.

Already solved.

---

### **Analytics**

Business snapshots.

Already solved.

---

### **Audit**

Already stores

business\_id

Solved.

---

### **Notifications**

Business-owned.

Solved.

---

Notice something nice?

We don't have to redesign **a single table**.

That is a strong sign the original schema and the multi-tenant model are aligned.

---

# **Step 5 — Business Context Lifecycle**

Every request follows this lifecycle:

User Login  
       │  
       ▼  
Authenticate  
       │  
       ▼  
Load Business Memberships  
       │  
       ▼  
User Chooses Business  
       │  
       ▼  
Issue Active Business Context  
       │  
       ▼  
Every API Request  
       │  
       ▼  
Authorization  
       │  
       ▼  
Application Service  
       │  
       ▼  
Repository  
       │  
       ▼  
PostgreSQL (RLS)

Notice that **authorization happens after the business context is established**. Permissions are always evaluated within a specific business, matching the `business_member → member_role → role_permission` model you've already designed.

**Step 6 \- Tenant Context Propagation** 

# **1\. JWT (Immutable Identity)**

JWT should answer only one question:

**Who are you?**

Nothing more.

JWT

├── user\_id

└── session\_id

That's it.

### **Why not `business_id`?**

Because users can belong to multiple businesses.

Example:

Rahul

ABC Traders (Owner)

XYZ Pharma (Accountant)

If `business_id` is inside the JWT, switching businesses means issuing a new JWT every time.

So we keep the JWT stable.

---

# **2\. Execution Context (Runtime)**

After login:

GET /businesses

↓

User selects

ABC Traders

Now the backend verifies:

business\_member

↓

ACTIVE

↓

Load Roles

↓

Create Execution Context

The execution context exists **only while handling the current request**.

For v1, I think it should contain only the essentials:

ExecutionContext

├── user\_id

├── session\_id

├── business\_id

└── business\_member\_id

Nothing else.

---

## **Why each field?**

### **user\_id**

Who is making the request?

Used for:

* audit logs  
* created\_by  
* updated\_by

---

### **session\_id**

Which login session?

Useful for:

* logout  
* security  
* suspicious activity

---

### **business\_id**

The active tenant.

Everything in Atlas uses this.

---

### **business\_member\_id**

This is the user's membership in that business.

It becomes useful later for RBAC because permissions are assigned to **business members**, not directly to users.

---

# **What about Roles and Permissions?**

I **would not** store them in the execution context.

Instead:

Execution Context

↓

Permission Guard

↓

Database / Cache

↓

Allowed?

Reason:

Roles can change while the user is logged in.

If we cache them inside every request context, we now have to deal with invalidation.

It's simpler and safer to fetch them (or cache them centrally) when permission checks occur.

---

# **How does a request work?**

JWT

│

├── user\_id

└── session\_id

↓

Business Selected

↓

Execution Context

user\_id

session\_id

business\_id

business\_member\_id

↓

Controller

↓

Application Service

↓

Repository

↓

PostgreSQL

Every layer receives the same execution context.

No layer asks:

Which business?

It already knows.

---

# **Why is this better than passing `business_id` everywhere?**

Instead of:

createInvoice(userId, businessId, ...)

you simply have:

createInvoice(context, ...)

where:

context.business\_id

is already validated.

This removes repetitive validation throughout the codebase.

### **MT-001 — Tenant Boundary**

A **Business** is the tenant boundary. Every tenant-scoped record belongs to exactly one business.

### **MT-002 — Authentication ≠ Tenant Selection**

Authentication identifies the user. Business selection establishes the active tenant context.

### **MT-003 — One Active Business Per Request**

Every authenticated request executes within exactly one active business context.

### **MT-004 — Business Membership Required**

A user may only establish a business context if an **ACTIVE** `business_member` record exists for that user and business.

### **MT-005 — Server-Controlled Tenant Context**

Tenant context is always derived and enforced by the backend. Client-provided tenant identifiers are never trusted for authorization.

### **MT-006 — Unified Execution Context**

Every execution path constructs and propagates a validated context containing identity, tenant, authorization, and tracing information, and binds it to the database session for the lifetime of the transaction.

# Chapter 2 — Row Level Security (RLS)

## **Objective**

Before designing Row-Level Security (RLS), every table must be classified according to **who owns the data** and **who is allowed to access it**.

**RLS is an implementation mechanism. Data ownership determines the security model.**

Every table in Atlas belongs to exactly one access category.

---

# **Category A — Global Platform Data**

## **Purpose**

Stores platform-wide configuration and reference data shared by all businesses.

These tables contain **no tenant-owned information**.

### **Tables**

| Table | Purpose |
| ----- | ----- |
| `permission` | Global permission catalog |
| `analytics_snapshot_type` | Snapshot definitions |
| `system_setting` | Platform configuration |
| `feature_flag` | Platform feature management |

### **Access Rules**

* Shared across all businesses.  
* Readable by application services.  
* Writable only by platform administrators or system migrations.  
* No tenant filtering required.

### **RLS Strategy**

**No Business RLS**

---

# **Category B — Identity Data**

## **Purpose**

Stores authentication and account information.

This data belongs to **individual users**, not businesses.

### **Tables**

| Table | Purpose |
| ----- | ----- |
| `user` | User accounts |
| `session` | Login sessions |
| `device` | Registered devices |
| `otp` | OTP verification requests |

### **Access Rules**

* Users may access only their own identity data.  
* Business membership has no effect on visibility.  
* Authentication services manage access.

### **RLS Strategy**

**User-Based RLS**

Access is filtered by `user_id`, not `business_id`.

---

# **Category C — Tenant Business Data**

## **Purpose**

Stores all business-owned operational data.

Every record belongs to **exactly one business**.

### **Tables**

### **Business**

* `business`  
* `business_member`  
* `business_settings`

### **Catalog**

* `category`  
* `brand`  
* `unit`  
* `product`  
* `product_image`

### **Inventory**

* `inventory`  
* `stock_movement`

### **Sales**

* `invoice`  
* `invoice_item`  
* `payment`

### **Purchasing**

* `purchase`  
* `purchase_item`  
* `supplier_payment`

### **CRM**

* `party`

### **Ledger**

* `ledger_account`  
* `journal_entry`  
* `journal_line`  
* `expense`

### **Security**

* `role`  
* `role_permission`  
* `member_role`

### **Workflow**

* `workflow`  
* `workflow_action`  
* `workflow_execution`

### **Notification**

* `notification`  
* `notification_template`  
* `notification_delivery`

### **Analytics**

* `analytics_snapshot`  
* `analytics_history`

### **AI**

* `conversation`  
* `message`  
* `ai_memory`

### **Access Rules**

* Every query executes within one active business context.  
* No business can access another business's records.  
* AI, analytics, workflow, and notifications inherit the same tenant isolation.  
* Application services never bypass tenant boundaries.  
* **Exception for Context Bootstrapping:** The `business_member` and `business` tables may be read using only a validated `user_id` so that an authenticated user can fetch their available businesses prior to establishing a `business_id` context.

### **RLS Strategy**

**Business-Based RLS** Access is filtered using the active `business_id` from the validated Execution Context. *(Note: `business` and `business_member` utilize a hybrid policy allowing read-access via the authenticated `user_id` during the login phase).*

---

# **Category D — Infrastructure Data**

## **Purpose**

Supports internal platform execution.

These tables coordinate system behavior rather than storing business functionality.

### **Tables**

* `event_outbox`  
* `background_job`

### **Access Rules**

* Never queried directly by end users.  
* Used only by application services and background workers.  
* Backend infrastructure manages all access.

### **RLS Strategy**

**Service Access Only**

No direct user access.

---

# **Category E — Observability Data**

## **Purpose**

Provides visibility into platform activity, auditing, and system events.

These tables record **what happened**, but are not the source of business operations.

### **Tables**

* `event`  
* `audit_log`  
* `security_event`

### **Access Rules**

* Written by platform services.  
* Read through dedicated APIs or administrative tools.  
* Never exposed as unrestricted database queries.  
* Supports auditing, compliance, debugging, and monitoring.

### **RLS Strategy**

**Service Access Only**

Any user-facing access must pass through application authorization rules.

---

# **Security Classification Summary**

| Category | Ownership | Access Model | RLS Strategy |
| ----- | ----- | ----- | ----- |
| **A. Global Platform** | Atlas Platform | Shared configuration | No Business RLS |
| **B. Identity** | Individual User | User-specific | User-Based RLS |
| **C. Tenant Business** | Business | Tenant-isolated | Business-Based RLS |
| **D. Infrastructure** | Atlas Platform | Internal services only | Service Access Only |
| **E. Observability** | Atlas Platform (records business activity) | Controlled APIs & admin tools | Service Access Only |

---

# **Architectural Laws**

### **RLS-001 — Ownership Defines Security**

Every table belongs to exactly one data access category.

Security policies are derived from ownership, not from schema structure.

---

### **RLS-002 — Global Data Is Never Tenant Data**

Platform reference tables are shared across all businesses and are never filtered by tenant.

---

### **RLS-003 — Identity Is Independent of Tenancy**

Identity data belongs to users.

Business membership does not determine visibility of identity records.

---

### **RLS-004 — Tenant Isolation Is Absolute**

Every business-owned record is visible only within its owning business.

This rule applies uniformly to operational data, AI conversations, analytics snapshots, workflows, notifications, and financial records.

---

### **RLS-005 — Infrastructure Is Backend-Only**

Infrastructure tables are internal implementation details.

They are never accessed directly by end-user application queries.

---

### **RLS-006 — Observability Is Controlled**

Audit logs, domain events, and security events are exposed only through authorized application services or administrative interfaces.

Direct unrestricted database access is prohibited.

**Chapter 2.2 \- PostgreSQL Roles** 

## **Objective**

Define how Atlas connects to PostgreSQL while following the **Principle of Least Privilege**.

Every database connection must use a dedicated PostgreSQL role based on its purpose.

This separates:

* Runtime application traffic  
* Internal platform services  
* Administrative operations  
* Database schema management

No single role should perform all responsibilities.

---

# **PostgreSQL Role Architecture**

Atlas uses **four PostgreSQL roles**.

                       PostgreSQL  
                            │  
       ┌────────────────────┼────────────────────┐  
       │                    │                    │  
       ▼                    ▼                    ▼  
   atlas\_app          atlas\_service        atlas\_admin  
                            │  
                            ▼  
                    atlas\_migration

Each role has a clearly defined responsibility.

---

# **1\. atlas\_app**

## **Purpose**

Handles all normal application requests.

Used by:

* REST API  
* Mobile App  
* Web App

### **Responsibilities**

* Read business data  
* Create business transactions  
* Update business records  
* Execute application services

### **Restrictions**

* Subject to Row-Level Security (RLS)  
* Cannot bypass tenant isolation  
* Cannot access platform configuration  
* Cannot perform schema changes

### **Execution Context**

Every request must establish:

user\_id  
session\_id  
business\_id  
business\_member\_id

before accessing PostgreSQL.

---

# **2\. atlas\_service**

## **Purpose**

Handles all internal platform processing.

Used by:

* Background Workers  
* Workflow Engine  
* Analytics Builder  
* Notification Worker  
* AI Services  
* Scheduled Jobs

### **Responsibilities**

* Process domain events  
* Execute workflows  
* Generate analytics  
* Deliver notifications  
* Execute AI tools  
* Run scheduled maintenance

### **Restrictions**

* Subject to Row-Level Security (RLS) by default  
* Does not automatically bypass tenant isolation  
* Must establish a valid Execution Context before accessing tenant data

### **Execution Context**

The context is reconstructed from trusted system data such as:

* Event payload  
* Background job payload  
* Workflow execution  
* AI conversation

Example:

Invoice Finalized  
       │  
       ▼  
Domain Event  
       │  
       ▼  
business\_id  
       │  
       ▼  
Execution Context  
       │  
       ▼  
PostgreSQL  
---

# **3\. atlas\_admin**

## **Purpose**

Performs platform administration and operational tasks.

Used by:

* Internal administration tools  
* Support utilities  
* Operational maintenance

### **Responsibilities**

* Platform diagnostics  
* Cross-tenant investigations  
* System configuration  
* Administrative reporting

### **Restrictions**

* Never used for normal application requests  
* Never used by business APIs  
* Access limited to trusted administrators

This role is the only runtime role permitted to perform controlled cross-tenant operations.

---

# **4\. atlas\_migration**

## **Purpose**

Responsible for database schema management.

Used by:

* Prisma Migrations  
* Initial database setup  
* Seed scripts  
* Schema upgrades

### **Responsibilities**

* Create tables  
* Alter schema  
* Create indexes  
* Create RLS policies  
* Create functions  
* Seed system data

### **Restrictions**

* Never serves runtime application traffic  
* Never processes business requests  
* Used only during deployment or maintenance

---

# **Role Responsibility Matrix**

| Capability | atlas\_app | atlas\_service | atlas\_admin | atlas\_migration |
| ----- | ----- | ----- | ----- | ----- |
| Business Operations | ✅ | ✅ | ⚠️ Limited | ❌ |
| Background Processing | ❌ | ✅ | ❌ | ❌ |
| AI Tool Execution | ❌ | ✅ | ❌ | ❌ |
| Workflow Execution | ❌ | ✅ | ❌ | ❌ |
| Subject to RLS | ✅ | ✅ | Configurable | ❌ |
| Cross-Tenant Access | ❌ | ❌ | ✅ | ✅ |
| Platform Configuration | ❌ | ❌ | ✅ | ✅ |
| Schema Changes | ❌ | ❌ | ❌ | ✅ |

---

# **Architectural Principles**

### **RLS-007 — Principle of Least Privilege**

Every PostgreSQL role receives only the minimum permissions required to perform its responsibilities.

---

### **RLS-008 — Runtime Consistency**

All runtime components, including HTTP requests, AI services, background workers, and workflow engines, operate under the same tenant isolation model.

---

### **RLS-009 — Tenant Isolation by Default**

Application and service roles must respect Row-Level Security.

Background execution never implies unrestricted database access.

---

### **RLS-010 — Explicit Administrative Access**

Cross-tenant access is permitted only through the dedicated administrative role and only for authorized operational tasks.

---

### **RLS-011 — Isolated Schema Management**

Database schema creation, migrations, and maintenance are performed exclusively by the migration role and are never mixed with runtime application execution.

**Chapter 2.3 Ownership Templates** 

## **Template 1 — Business Ownership**

Applies to:

* Sales  
* Inventory  
* Purchasing  
* CRM  
* Ledger  
* AI  
* Analytics  
* Workflow  
* Notification  
* Catalog  
* Business

---

## **Template 2 — User Ownership**

Applies to:

* user  
* session  
* device  
* otp

---

## **Template 3 — Platform Reference**

Applies to:

* permission  
* feature\_flag  
* system\_setting  
* analytics\_snapshot\_type

---

## **Template 4 — Internal System**

Applies to:

* event  
* event\_outbox  
* audit\_log  
* security\_event  
* background\_job

## **RLS-012 — Ownership-Based Policy Templates**

Row-Level Security policies are defined by **data ownership**, not by individual tables.

Every table inherits one of the predefined ownership templates.

This ensures that the security model remains consistent, predictable, and extensible as new domains and tables are introduced.

| Ownership | Applies To | RLS Strategy |
| ----- | ----- | ----- |
| **Business-Owned** | Sales, Purchasing, Inventory, CRM, Ledger, AI, Analytics, Workflow, Notification, Catalog, Business | Filter by `business_id` |
| **User-Owned** | User, Session, Device, OTP | Filter by `user_id` |
| **Platform-Owned** | Permission, Feature Flag, System Setting, Analytics Snapshot Type | No tenant filtering |
| **System-Owned** | Event, Outbox, Background Job, Audit, Security Event | Internal service access only |

# Chapter 2.4 — Universal RLS Policy Rules

## **Objective**

Define a **small set of universal RLS rules** that apply to all Atlas tables based on their **ownership type**, instead of designing separate rules for every table.

---

## **Core Principle**

RLS policies are based on **ownership templates**, not individual tables.

Every table inherits one of four ownership models:

| Ownership Type | Applies To | Access Rule |
| ----- | ----- | ----- |
| **Business-Owned** | Sales, Inventory, Ledger, AI, Analytics, Workflow, etc. | Access only within the active `business_id`. |
| **User-Owned** | User, Session, Device, OTP | Access only within the authenticated `user_id`. |
| **Platform-Owned** | Permission, Feature Flag, System Setting | Shared platform data; no tenant filtering. |
| **System-Owned** | Event, Audit, Outbox, Background Jobs | Internal services and administrators only. |

---

## **Universal CRUD Rules**

| Operation | Business-Owned | User-Owned |
| ----- | ----- | ----- |
| **SELECT** | Read only own business rows | Read only own rows |
| **INSERT** | New row must belong to active business | New row must belong to authenticated user |
| **UPDATE** | Update only own rows; ownership cannot change | Update only own rows; ownership cannot change |
| **DELETE** | Allowed only if business rules permit and ownership matches | Allowed only if business rules permit and ownership matches |

---

## **Ownership Is Immutable**

Once a row is created:

* `business_id` can never change for business-owned data.  
* `user_id` can never change for user-owned data.

Rows are never transferred between owners.

---

## **Important Principle**

**RLS only answers one question:**

**"Can this owner access this row?"**

It does **not** decide whether the operation itself is valid.

---

## **Separation of Responsibilities**

| Layer | Responsibility |
| ----- | ----- |
| Authentication | Who is the user? |
| Business Context | Which business is active? |
| Authorization (RBAC) | Can the user perform this action? |
| **RLS** | Does this row belong to the user/business? |
| Business Rules | Is the requested operation valid? |

---

## **Key Architectural Laws**

* **Ownership-based templates** drive all RLS policies.  
* **Tenant ownership is immutable.**  
* **RLS is not business logic.**  
* **Business rules remain in Application Services.**  
* **Authorization and RLS are independent layers of security.**

# Chapter2.5—Execution Context→PostgreSQLSession

## **Objective**

Define how the validated **Execution Context** is propagated from the application to PostgreSQL so that every database operation executes within the correct security context.

This chapter establishes the contract between the Atlas application and the database.

---

# **Core Principle**

The application is responsible for **creating** the Execution Context.

PostgreSQL is responsible for **enforcing** it.

Neither layer performs the other's responsibility.

---

# **Execution Context**

Every business operation executes within a validated Execution Context.

Execution Context  
─────────────────────────  
user\_id  
session\_id  
business\_id  
business\_member\_id

This context is created only after:

* User authentication  
* Business selection  
* Membership validation

---

# **Execution Flow**

Every request follows the same lifecycle.

Incoming Request  
       │  
       ▼  
Authentication  
       │  
       ▼  
Business Validation  
       │  
       ▼  
Execution Context Created  
       │  
       ▼  
Open Database Transaction  
       │  
       ▼  
Bind Execution Context  
       │  
       ▼  
Repository Operations  
       │  
       ▼  
Row-Level Security  
       │  
       ▼  
Commit / Rollback

This flow applies equally to:

* HTTP requests  
* Background workers  
* AI tool execution  
* Scheduled jobs  
* Workflow execution

---

# **Execution Context Binding**

Before executing any database query, the current Execution Context must be associated with the active database transaction.

Once bound:

* PostgreSQL can evaluate Row-Level Security policies.  
* Repositories no longer perform tenant filtering.  
* Every query automatically executes within the correct ownership boundary.

The application establishes the context once.

The database reuses it throughout the transaction.

---

# **Transaction Scope**

Execution Context is **transaction-scoped**.

Begin Transaction  
       │  
Bind Context  
       │  
Execute Queries  
       │  
Commit / Rollback  
       │  
Context Discarded

The context must never survive beyond the transaction.

Every new transaction receives a fresh Execution Context.

---

# **Repository Design**

Repositories are intentionally tenant-agnostic.

Instead of:

findInvoice(id, business\_id)

Repositories become:

findInvoice(id)

Tenant isolation is enforced by Row-Level Security, not repository code.

This eliminates duplicated filtering logic and reduces the risk of accidental cross-tenant access.

---

# **Context Immutability**

Execution Context is immutable.

Once a transaction begins:

* `user_id` cannot change.  
* `business_id` cannot change.  
* `business_member_id` cannot change.

If the user switches businesses, Atlas creates a new Execution Context and starts a new transaction.

A transaction never changes tenant.

---

# **Worker Execution**

Background workers follow the same model.

Execution Context is reconstructed from trusted system data, such as:

* Domain Events  
* Background Jobs  
* Workflow Executions

After reconstruction:

Worker  
     │  
Execution Context  
     │  
Bind Context  
     │  
Execute Queries

Workers never bypass tenant isolation simply because they execute asynchronously.

---

# **AI Execution**

AI follows exactly the same architecture.

Conversation  
     │  
business\_id  
     │  
Execution Context  
     │  
Bind Context  
     │  
Application Services  
     │  
Database

AI never communicates directly with PostgreSQL.

AI never bypasses Row-Level Security.

---

# **Platform Operations**

Most repository operations execute inside an Execution Context.

However, certain platform operations legitimately require broader access, such as:

* Database migrations  
* Platform administration  
* Cross-tenant maintenance  
* Data repair utilities

These operations use dedicated PostgreSQL roles (`atlas_admin` or `atlas_migration`) and do not participate in normal tenant-scoped execution.

They are explicitly isolated from runtime business operations.

---

# **Architectural Laws**

### **RLS-015 — Context Before Queries**

Every tenant-scoped database transaction must establish a validated Execution Context before executing any query.

---

### **RLS-016 — Transaction-Scoped Context**

Execution Context exists only for the lifetime of a single database transaction.

It is discarded immediately after commit or rollback.

---

### **RLS-017 — Repository Independence**

Repositories must not implement tenant isolation.

Tenant isolation is enforced exclusively through Row-Level Security.

---

### **RLS-018 — Immutable Context**

Execution Context cannot change during a transaction.

Changing the active business always requires a new transaction.

---

### **RLS-019 — Unified Execution Model**

HTTP requests, AI tools, background workers, scheduled jobs, and workflow executions all follow the same Execution Context lifecycle.

---

### **RLS-020 — Explicit Platform Access**

Cross-tenant operations are permitted only through dedicated platform roles and are never part of normal tenant-scoped execution.

# Chapter 2.6 — Privileged Operations

## **Objective**

Define the limited set of operations that are permitted to execute outside the normal tenant-scoped execution model.

The purpose of this chapter is to ensure that tenant isolation remains the default behavior across the Atlas platform and that any exception is explicit, justified, and controlled.

---

# **Core Principle**

All runtime business operations execute within a validated **Execution Context** and are subject to Row-Level Security.

Execution outside this model is considered a privileged operation and must be explicitly authorized by the platform architecture.

---

# **Normal Execution**

The following runtime components always follow the standard execution pipeline:

Execution Context  
       │  
       ▼  
PostgreSQL Session  
       │  
       ▼  
Row-Level Security

This includes:

* HTTP API requests  
* Mobile and Web requests  
* Background workers  
* Workflow execution  
* AI tool execution  
* Scheduled jobs  
* Notification processing  
* Analytics generation

These components **do not bypass RLS**.

Instead, they reconstruct or inherit a valid Execution Context before accessing tenant data.

---

# **Privileged Operations**

Only operations that manage the platform itself may execute outside normal tenant-scoped execution.

Examples include:

## **Database Migrations**

Responsibilities:

* Create or modify schema  
* Create indexes  
* Define RLS policies  
* Deploy database changes

Executed using:

atlas\_migration  
---

## **Initial Platform Seeding**

Responsibilities:

* Global permissions  
* Feature flags  
* System settings  
* Snapshot type definitions

Executed using:

atlas\_migration  
---

## **Platform Administration**

Responsibilities:

* Operational diagnostics  
* Customer support (where authorized)  
* Platform maintenance  
* Controlled cross-tenant administration

Executed using:

atlas\_admin  
---

## **Disaster Recovery**

Responsibilities:

* Restore backups  
* Repair corrupted data  
* Emergency maintenance

Executed using:

atlas\_admin

or other dedicated maintenance tooling.

---

# **Explicit Non-Privileged Operations**

The following operations are **not** considered privileged, even though they execute in the background.

| Component | Requires Execution Context | Subject to RLS |
| ----- | ----- | ----- |
| Background Workers | ✅ | ✅ |
| Workflow Engine | ✅ | ✅ |
| AI Services | ✅ | ✅ |
| Notification Worker | ✅ | ✅ |
| Analytics Builder | ✅ | ✅ |
| Scheduled Jobs | ✅ | ✅ |

Asynchronous execution does not imply elevated database privileges.

---

# **Architectural Principles**

### **RLS-021 — Runtime Consistency**

Every runtime component executes within the same tenant-aware security model, regardless of whether it is user-initiated or system-initiated.

---

### **RLS-022 — Privileged Access Is Exceptional**

Execution outside tenant-scoped security is reserved exclusively for platform administration and database management.

Privileged execution must never be used as a shortcut for business functionality.

---

### **RLS-023 — No Convenience Bypass**

Runtime services must not bypass Row-Level Security to simplify implementation or improve performance.

If a service requires tenant data, it must establish a valid Execution Context.

---

### **RLS-024 — Separation of Operational Concerns**

Platform management responsibilities remain isolated from business execution.

Administrative capabilities are provided through dedicated PostgreSQL roles and are never mixed with normal application traffic.

# Chapter 3 — Transaction & Unit of Work Strategy

# **Chapter 3.1 — Transaction Philosophy & Unit of Work**

## **Objective**

Define how Atlas groups business changes into reliable, atomic operations.

This chapter establishes the relationship between:

* Business Operations  
* Unit of Work  
* Database Transactions

and defines where transactional responsibility belongs.

---

# **Core Principle**

Atlas does **not** create transactions for individual SQL statements.

Atlas creates transactions for **Business Operations**.

Everything else derives from this principle.

---

# **Business Operation**

## **Definition**

A **Business Operation** is a complete business action that produces a meaningful business outcome.

Examples:

Create Invoice

Receive Payment

Create Purchase Order

Adjust Inventory

Record Expense

Approve Workflow

Create Product

Notice these are business concepts.

Not database concepts.

---

## **A Business Operation is NOT**

A Business Operation is **not**:

* an HTTP request  
* a controller method  
* a repository method  
* a SQL statement  
* a table insert

Those are implementation details.

For example:

POST /invoice

may become

Validate Customer

↓

Validate Stock

↓

Create Invoice

↓

Create Invoice Items

↓

Create Stock Movements

↓

Create Journal Entry

↓

Write Audit Log

↓

Create Outbox Event

↓

Commit

To the business,

this is still **one operation**:

Create Invoice

---

# **Unit of Work**

## **Definition**

A **Unit of Work** represents all database changes required to complete one Business Operation.

It is the transactional boundary of the operation.

Example:

Business Operation

Create Invoice  
       │  
       ▼  
Unit of Work  
       │  
       ├── Invoice  
       ├── Invoice Items  
       ├── Stock Movement  
       ├── Journal Entry  
       ├── Audit Log  
       └── Outbox Event

All of these changes either:

* succeed together, or  
* fail together.

---

# **Relationship Between Concepts**

The hierarchy is:

Business Operation  
       │  
       ▼  
Unit of Work  
       │  
       ▼  
Database Transaction

Meaning:

* The **Business Operation** defines the intent.  
* The **Unit of Work** defines the changes.  
* The **Database Transaction** guarantees atomicity.

Each layer has a different responsibility.

---

# **Transaction Ownership**

This is one of the most important design decisions.

## **Who owns the transaction?**

Not:

* Controllers  
* Repositories  
* Individual domain entities

The transaction belongs to the **Application Service** that coordinates the Business Operation.

Example:

Sales Application Service  
       │  
       ▼  
Begin Transaction  
       │  
       ▼  
Business Logic  
       │  
       ▼  
Repository Operations  
       │  
       ▼  
Commit / Rollback

Repositories should never start or commit transactions.

They simply execute database operations within the active Unit of Work.

---

# **Scope of a Unit of Work**

A Unit of Work should include only the changes required to complete one Business Operation.

Example:

Create Invoice

✓ Invoice  
✓ Invoice Items  
✓ Stock Movement  
✓ Journal Entry  
✓ Audit Log  
✓ Outbox Event

COMMIT

It should **not** include:

Analytics Snapshot

Notification

Email

AI Summary

Workflow Execution

Those are downstream processes.

They happen after commit.

---

# **Why This Matters**

Suppose email delivery fails.

Should invoice creation fail?

No.

Suppose analytics rebuilding fails.

Should stock rollback?

No.

Only the data required to preserve business consistency belongs inside the Unit of Work.

Everything else is eventually consistent.

---

# **Architectural Principles**

### **TX-001 — Business Operation First**

Transactions exist to complete Business Operations, not individual database statements.

---

### **TX-002 — One Business Operation, One Unit of Work**

Each Business Operation executes within exactly one Unit of Work.

---

### **TX-003 — Unit of Work Owns Atomicity**

All changes inside a Unit of Work either commit together or rollback together.

Partial completion is never permitted.

---

### **TX-004 — Application Services Own Transactions**

Application Services are responsible for creating, committing, and rolling back Units of Work.

Controllers and repositories never manage transactions.

---

### **TX-005 — Unit of Work Contains Only Business-Critical Changes**

Only changes required to maintain business consistency belong inside the Unit of Work.

Downstream integrations execute after a successful commit.

# **Chapter 3.2 — Transaction Boundaries**

## **Objective**

Define the boundaries of a **Unit of Work** by identifying which changes must commit atomically and which should execute asynchronously after a successful commit.

The goal is to maximize data consistency while minimizing transaction duration and coupling.

---

# **Core Principle**

A transaction should contain **only the changes required to preserve business consistency**.

Everything else should happen after the transaction commits.

---

# **The ACID Boundary**

Let's take the simplest example.

## **Business Operation**

Create Invoice

What actually happens?

Invoice

Invoice Items

Stock Movement

Inventory Projection

Journal Entry

Audit Log

Outbox Event

Notification

Analytics Snapshot

AI Summary

Should all of these be inside one transaction?

No.

---

# **Let's classify them.**

## **Category A — Business-Critical Changes**

These are required for the business operation to be considered valid.

If one fails, **everything must roll back**.

For `Create Invoice`:

Invoice

Invoice Items

Stock Movement

Inventory Projection

Journal Entry

Audit Log

Outbox Event

These belong to **one Unit of Work**.

---

## **Why Inventory Projection?**

Good question.

Looking at your schema:

You have both:

Stock Movement

and

Inventory

`stock_movement` is the immutable ledger.

`inventory` is the current projection (current quantity).

If the stock movement is committed but inventory isn't updated:

Invoice

↓

Stock Movement

↓

Inventory unchanged

Now the dashboard shows incorrect stock.

Your own system becomes inconsistent.

Therefore:

Inventory projection belongs inside the same transaction.

---

## **Why Audit Log?**

Suppose this happens:

Invoice Created

↓

Audit Failed

Should the invoice still exist?

I would say **no**.

Because Atlas promises complete traceability.

A business operation without an audit trail breaks one of our architectural guarantees.

Therefore:

Audit belongs inside the Unit of Work.

---

## **Why Outbox?**

This is one of the biggest architectural decisions.

Many systems do:

Commit

↓

Publish Event

If the application crashes here:

Commit ✅

Publish ❌

The invoice exists.

But no worker ever knows.

Notifications never send.

Analytics never update.

Workflow never starts.

The system becomes permanently inconsistent.

That's why the Outbox pattern exists.

The Outbox record is business-critical and must be written inside the same transaction.

The event **processing** happens later.

---

# **Category B — Eventually Consistent Operations**

These do **not** belong inside the transaction.

Examples:

Notification

Email

SMS

Push Notification

Analytics Rebuild

AI Summary

Workflow Execution

Webhook Delivery

These consume the Outbox event after commit.

If one of them fails:

Retry.

The business transaction is already complete.

---

# **The Boundary**

So for Atlas:

Business Operation  
       │  
       ▼  
Begin Transaction  
       │  
       ├── Invoice  
       ├── Invoice Items  
       ├── Stock Movement  
       ├── Inventory Projection  
       ├── Journal Entry  
       ├── Audit Log  
       ├── Outbox Event  
       │  
       ▼  
Commit  
       │  
       ▼  
Workers  
       ├── Notifications  
       ├── Analytics  
       ├── AI  
       ├── Workflow  
       └── Webhooks  
---

# **Service Coordination**

Now we answer another important question.

Can services call other services?

Example:

Sales Service

↓

Inventory Service

↓

Ledger Service

I think the answer is:

**Yes, but only within the same Business Operation.**

These services are collaborating to complete one Unit of Work.

They're not independent workflows.

The Application Service orchestrates them.

For example:

SalesApplicationService

↓

InventoryDomainService

↓

LedgerDomainService

↓

Repositories

None of these services starts its own transaction.

They participate in the existing one.

---

# **What Should Never Happen?**

This should never happen:

Sales Service

↓

Commit

↓

Inventory Service

↓

Commit

↓

Ledger Service

↓

Commit

Now you have three independent transactions.

If the third one fails,

the first two already committed.

Atlas is inconsistent.

---

# **Architectural Principles**

### **TX-006 — Business-Critical Consistency**

Every change required to preserve business correctness must be committed within the same Unit of Work.

---

### **TX-007 — Eventual Consistency for Integrations**

Operations that communicate, notify, analyze, or automate execute only after the business transaction commits successfully.

---

### **TX-008 — Single Transaction per Business Operation**

A Business Operation must never be split across multiple independent database transactions.

---

### **TX-009 — Shared Unit of Work**

Multiple domain services may participate in the same Unit of Work, but none may create or commit independent transactions.

---

### **TX-010 — Outbox Is Part of the Transaction**

The Outbox record is business-critical and must be written atomically with the business data.

Event processing is asynchronous.

# **Chapter 3.2.1 — Transaction Blueprints**

## **Objective**

Define the transactional flow for major business operations in Atlas.

Each blueprint identifies:

* participating tables  
* transactional boundaries  
* commit order  
* eventual consistency boundaries

These blueprints serve as the implementation contract for Application Services.

---

# **Blueprint 1 — Create Sales Invoice**

## **Business Operation**

Create Invoice

## **Transaction Flow**

                        Create Invoice  
                              │  
                              ▼  
                   Begin Unit of Work  
                              │  
                              ▼  
                Validate Business Rules  
         (Customer, Stock, Permissions, etc.)  
                              │  
                              ▼  
       ┌──────────────────────────────────────────────┐  
       │          SINGLE DATABASE TRANSACTION         │  
       │──────────────────────────────────────────────│  
       │                                              │  
       │ 1\. invoice                                   │  
       │        │                                     │  
       │        ▼                                     │  
       │ 2\. invoice\_item                             │  
       │        │                                     │  
       │        ▼                                     │  
       │ 3\. stock\_movement                           │  
       │        │                                     │  
       │        ▼                                     │  
       │ 4\. inventory (projection update)            │  
       │        │                                     │  
       │        ▼                                     │  
       │ 5\. journal\_entry                            │  
       │        │                                     │  
       │        ▼                                     │  
       │ 6\. journal\_line                             │  
       │        │                                     │  
       │        ▼                                     │  
      │ 7\. audit\_log │ │ │ │ │ ▼ │ │ \*\*8. event (canonical domain event)\*\* │ │ │ │ │ ▼ │ │ \*\*9. event\_outbox\*\* │   
       └──────────────────────────────────────────────┘  
                              │  
                              ▼  
                          COMMIT  
                              │  
                              ▼  
         ┌────────────────────────────────────────┐  
         │       EVENTUALLY CONSISTENT            │  
         │────────────────────────────────────────│  
         │ Analytics Snapshot Update              │  
         │ Notification Delivery                  │  
         │ Workflow Execution                     │  
         │ AI Context / Memory Update             │  
         │ External Webhooks                      │  
         └────────────────────────────────────────┘  
---

## **Atomic Tables**

| Table | Reason |
| ----- | ----- |
| `invoice` | Primary business document |
| `invoice_item` | Line items |
| `stock_movement` | Immutable inventory ledger |
| `inventory` | Current inventory projection |
| `journal_entry` | Financial transaction |
| `journal_line` | Double-entry accounting |
| `audit_log` | Compliance and traceability |
| `event_outbox` | Guarantees reliable event publication |

---

## **Eventually Consistent Components**

* Analytics  
* Notifications  
* Workflow  
* AI  
* Webhooks

These are triggered **after** a successful commit.

---

# **Blueprint 2 — Receive Customer Payment**

                   Receive Payment  
                          │  
                          ▼  
                 Begin Unit of Work  
                          │  
                          ▼  
┌──────────────────────────────────────────────────┐  
│          SINGLE DATABASE TRANSACTION             │  
│──────────────────────────────────────────────────│  
│ payment                                          │  
│ invoice (balance / status update)                │  
│ journal\_entry                                    │  
│ journal\_line                                     │  
│ audit\_log   
event (canonical domain event)\*\*                                        │  
│ event\_outbox                                     │  
└──────────────────────────────────────────────────┘  
                          │  
                          ▼  
                       COMMIT  
                          │  
                          ▼  
Analytics  
Notifications  
AI  
Workflow  
---

# **Blueprint 3 — Create Purchase**

                    Create Purchase  
                           │  
                           ▼  
                Begin Unit of Work  
                           │  
                           ▼  
┌──────────────────────────────────────────────────┐  
│          SINGLE DATABASE TRANSACTION             │  
│──────────────────────────────────────────────────│  
│ purchase                                         │  
│ purchase\_item                                    │  
│ stock\_movement                                   │  
│ inventory                                        │  
│ journal\_entry                                    │  
│ journal\_line                                     │  
│ audit\_log   
\*event (canonical domain event)\*\*                                        │  
│ event\_outbox                                     │  
└──────────────────────────────────────────────────┘  
                           │  
                           ▼  
                        COMMIT  
                           │  
                           ▼  
Analytics  
Notifications  
Workflow  
AI  
---

# **Blueprint 4 — Record Expense**

                   Record Expense  
                          │  
                          ▼  
                Begin Unit of Work  
                          │  
                          ▼  
┌──────────────────────────────────────────────────┐  
│          SINGLE DATABASE TRANSACTION             │  
│──────────────────────────────────────────────────│  
│ expense                                          │  
│ journal\_entry                                    │  
│ journal\_line                                     │  
│ audit\_log   
 event (canonical domain event)\*\*                                        │  
│ event\_outbox                                     │  
└──────────────────────────────────────────────────┘  
                          │  
                          ▼  
                       COMMIT  
                          │  
                          ▼  
Analytics  
Notifications  
AI  
---

# **Blueprint 5 — Inventory Adjustment**

                Inventory Adjustment  
                         │  
                         ▼  
               Begin Unit of Work  
                         │  
                         ▼  
┌──────────────────────────────────────────────────┐  
│          SINGLE DATABASE TRANSACTION             │  
│──────────────────────────────────────────────────│  
│ stock\_movement                                   │  
│ inventory                                        │  
│ audit\_log  
event (canonical domain event)\*\*                                         │  
│ event\_outbox                                     │  
└──────────────────────────────────────────────────┘  
                         │  
                         ▼  
                      COMMIT  
                         │  
                         ▼  
Analytics  
Notifications  
Workflow  
---

# **Universal Transaction Pattern**

Every business operation in Atlas follows the same architectural structure.

Business Operation  
       │  
       ▼  
Validate Business Rules  
       │  
       ▼  
Begin Unit of Work  
       │  
       ▼  
Business Tables  
       │  
       ▼  
Ledger / Financial Tables  
       │  
       ▼  
Audit Log  
       │  
       ▼  
Event Outbox  
       │  
       ▼  
COMMIT  
       │  
       ▼  
Background Workers  
       ├── Analytics  
       ├── Notifications  
       ├── Workflow  
       ├── AI  
       └── Webhooks  
---

# **Architectural Principles**

### **TX-011 — Blueprint-Driven Transactions**

Every multi-entity business operation must have a defined Transaction Blueprint describing its transactional scope and participating tables.

---

### **TX-012 — Business Data Before Integrations**

All business-critical data must be committed before any asynchronous integration begins.

---

### **TX-013 — Outbox Is the Transaction Boundary**

The successful creation of an `event_outbox` record marks the completion of the atomic business transaction. All downstream processing originates from this event.

# **Chapter 3.3 — Commit, Rollback & Event Processing**

## **Objective**

Define how Atlas completes, aborts, and propagates Business Operations while guaranteeing data consistency and reliable event delivery.

This chapter establishes:

* Commit rules  
* Rollback rules  
* Event publication  
* Outbox processing  
* Eventual consistency

---

# **Core Principle**

A Business Operation has only two valid outcomes:

Business Operation  
       │  
       ▼  
   SUCCESS  
       │  
       ▼  
Everything commits

or

Business Operation  
       │  
       ▼  
   FAILURE  
       │  
       ▼  
Everything rolls back

There is **no partial success** inside a Unit of Work.

---

# **Successful Transaction**

Let's revisit the Invoice blueprint.

Create Invoice  
       │  
       ▼  
Begin Transaction  
       │  
       ▼  
Invoice  
Invoice Items  
Stock Movement  
Inventory  
Journal Entry  
Journal Lines  
Audit Log  
Outbox  
       │  
       ▼  
COMMIT

Once the commit succeeds,

Atlas guarantees that **all** business-critical data exists together.

Only after this point does asynchronous processing begin.

---

# **Failed Transaction**

Suppose this happens:

Invoice ✔

Invoice Items ✔

Stock Movement ✔

Journal Entry ❌

Result:

ROLLBACK

Everything disappears.

No invoice.

No stock movement.

No inventory update.

No audit.

No outbox.

It is as though the Business Operation never happened.

---

# **Why the Outbox Is Inside the Transaction**

This deserves special attention because it's the cornerstone of Atlas's event-driven architecture.

Imagine the Outbox were written **after** the commit.

Commit ✔

↓

Application crashes

↓

Outbox never written

Consequences:

* Notification never sent.  
* Analytics never updated.  
* Workflow never started.  
* AI never learns about the operation.

The business data exists, but the rest of the platform is unaware.

This is an inconsistent state.

Instead, Atlas treats the `event_outbox` record as part of the Business Operation.

Invoice

Journal Entry

Audit

Outbox

↓

COMMIT

If the commit succeeds, the event is guaranteed to exist.

---

# **Event Processing**

After commit:

Outbox  
     │  
     ▼  
Worker  
     │  
     ├── Analytics  
     ├── Workflow  
     ├── Notification  
     ├── AI  
     └── Webhooks

Notice something important.

The Business Operation is already complete.

Workers are **consumers**, not participants.

---

# **What If a Worker Fails?**

Example:

Invoice Commit ✔

↓

Notification Worker ❌

Should Atlas rollback the invoice?

Absolutely not.

The invoice is already valid.

Instead:

Retry

↓

Retry

↓

Retry

Until successful.

This is the essence of **eventual consistency**.

---

# **What If Analytics Fails?**

Invoice ✔

↓

Analytics ❌

Dashboard becomes temporarily stale.

Business data remains correct.

Worker retries.

Eventually:

Analytics ✔

Consistency restored.

---

# **Event Processing Principles**

The Outbox guarantees:

Business Data

↓

Commit

↓

Event Exists

It does **not** guarantee:

Notification delivered immediately.

Analytics updated immediately.

Workflow executed immediately.

Those are asynchronous responsibilities.

---

# **Failure Classification**

Atlas distinguishes between two fundamentally different types of failures.

| Failure Type | Example | Result |
| ----- | ----- | ----- |
| **Transactional Failure** | Constraint violation, insufficient stock, journal imbalance | Entire Unit of Work rolls back |
| **Asynchronous Failure** | Email failure, webhook timeout, analytics rebuild failure | Business transaction remains committed; worker retries |

This distinction is critical because it determines whether the user sees an error or the platform handles recovery in the background.

---

# **Commit Lifecycle**

Business Operation  
       │  
       ▼  
Begin Transaction  
       │  
       ▼  
Business Writes  
       │  
       ▼  
Audit Log  
       │  
       ▼  
Outbox Event  
       │  
       ▼  
COMMIT  
       │  
       ▼  
Workers Pick Event  
       │  
       ▼  
Analytics  
Workflow  
Notification  
AI

This becomes the standard lifecycle for every major operation in Atlas.

---

# **Architectural Principles**

### **TX-014 — Atomic Business Commit**

A Business Operation is successful only when every business-critical change commits together.

---

### **TX-015 — Atomic Rollback**

If any business-critical change fails, the entire Unit of Work must roll back.

Partial business state is never permitted.

---

### **TX-016 — Reliable Event Publication**

Every committed Business Operation must produce its corresponding Outbox event within the same transaction.

---

### **TX-017 — Post-Commit Processing**

Analytics, workflows, notifications, AI processing, and external integrations execute only after a successful commit.

---

### **TX-018 — Eventual Consistency**

Failures in asynchronous processing must never invalidate completed business transactions.

Recovery is achieved through retries and idempotent event consumers.

# Chapter 4 — Event & Outbox Architecture

# **Chapter 4.1 — Event Philosophy**

## **Objective**

Define the purpose, ownership, and role of Domain Events within Atlas.

This chapter establishes Domain Events as the canonical language of communication across the Atlas platform, enabling independent modules and future integrations to react to completed business operations without creating direct dependencies.

---

# **Core Principle**

A **Domain Event** represents a completed business fact.

Every significant Business Operation publishes **one canonical Domain Event**, which becomes the single source of truth for all downstream processing.

The event is published only after the Business Operation has been successfully committed.

---

# **Why Atlas Uses Events**

Atlas consists of multiple independent domains.

Sales  
Inventory  
Purchasing  
Ledger  
CRM  
AI  
Analytics  
Workflow  
Notification

These domains must collaborate without becoming tightly coupled.

Instead of calling each other directly, domains communicate by publishing business facts.

Invoice Finalized

↓

invoice.finalized

Every interested component decides independently how to respond.

---

# **Canonical Event Model**

Atlas maintains **one canonical event model**.

Every Business Operation publishes exactly one business event describing what happened.

Example:

Business Operation

↓

Create Invoice

↓

invoice.finalized

This event becomes the official representation of that business outcome throughout the platform.

There are **not** separate internal and external versions of the event.

Atlas speaks one common language.

---

# **Events Represent Facts, Not Commands**

Events describe something that has already happened.

Correct:

invoice.finalized

payment.received

stock.adjusted

Incorrect:

send.notification

update.analytics

create.workflow

Those are actions performed by consumers.

They are not business facts.

---

# **Event Ownership**

Each Domain Event belongs to exactly one business domain.

Example:

Sales  
   │  
   ├── invoice.created  
   ├── invoice.finalized  
   └── payment.received  
Inventory  
   │  
   ├── stock.received  
   ├── stock.adjusted  
   └── inventory.recounted

Only the owning domain may publish its events.

Other domains consume them.

This guarantees a single source of truth.

---

# **Unified Event Flow**

Every Business Operation follows the same communication model.

Business Operation  
       │  
       ▼  
Canonical Domain Event  
       │  
       ▼  
Outbox  
       │  
       ▼  
Event Dispatcher  
       │  
       ├────────► Internal Consumers  
       │  
       └────────► Integration Adapters  
                         │  
                         ▼  
                 External Systems

Notice what this means.

The producing domain knows nothing about:

* Analytics  
* AI  
* Workflow  
* Notifications  
* External systems

It simply publishes the business fact.

Everyone else subscribes.

---

# **Internal Consumers**

Internal platform capabilities react to the event independently.

Example:

invoice.finalized  
       │  
       ├── Analytics  
       ├── AI  
       ├── Workflow  
       └── Notification

Each consumer has its own responsibility.

No consumer modifies the producer's transaction.

---

# **External Integrations**

External systems participate in exactly the same event stream.

invoice.finalized  
       │  
       ▼  
Integration Adapter  
       │  
       ├── Shopify  
       ├── WhatsApp  
       ├── Razorpay  
       ├── Tally  
       └── QuickBooks

Integration Adapters translate Atlas's canonical event into the format required by each external system.

The producing domain remains completely independent of third-party APIs.

---

# **Why This Architecture Scales**

As Atlas grows, new consumers can subscribe without changing existing business domains.

Example:

invoice.finalized  
       │  
       ├── Analytics  
       ├── AI  
       ├── Workflow  
       ├── Notification  
       ├── Shopify Adapter  
       ├── WhatsApp Adapter  
       ├── Tally Adapter  
       ├── QuickBooks Adapter  
       └── Future Integrations

The Sales domain never changes.

Only new subscribers are added.

This preserves loose coupling while allowing the platform to evolve.

---

# **Architectural Principles**

### **EV-001 — Business Facts**

Every Domain Event represents a completed business fact.

Events never represent commands or requests.

---

### **EV-002 — Single Canonical Event**

Each Business Operation publishes one canonical Domain Event that serves as the authoritative representation of the business outcome.

---

### **EV-003 — Single Publisher**

Every event type has exactly one owning domain responsible for publishing it.

Consumers must never publish events owned by another domain.

---

### **EV-004 — Loose Coupling**

Domains communicate exclusively through canonical events rather than direct dependencies.

Publishers remain unaware of their consumers.

---

### **EV-005 — Event Immutability**

Published events are immutable.

Business changes are represented by publishing new events rather than modifying existing ones.

---

### **EV-006 — Integration Through Adapters**

External integrations consume canonical Domain Events through dedicated Integration Adapters.

Business domains never communicate directly with external systems.

# **Chapter 4.2 — Event Propagation Architecture**

## **Objective**

Define how Atlas reliably propagates Domain Events from completed Business Operations to internal modules and external integrations while preserving transactional consistency, reliability, and loose coupling.

This chapter establishes the complete event propagation pipeline used throughout the platform.

---

# **Core Principle**

A Domain Event becomes visible to the rest of the platform **only after the originating Business Operation has been successfully committed**.

Business transactions and event propagation are separate phases connected through the Event Outbox.

---

# **Why Event Propagation Exists**

Consider the completion of an invoice.

Without an event propagation mechanism:

Create Invoice  
       │  
       ▼  
Commit Database  
       │  
       ▼  
Notify Analytics  
Notify AI  
Notify Workflow  
Notify Integrations

If the application crashes immediately after the commit,

the invoice exists,

but nothing else in the platform knows about it.

Atlas avoids this problem by separating **transaction completion** from **event propagation**.

---

# **Event Propagation Pipeline**

Every Domain Event follows the same lifecycle.

                Business Operation  
                       │  
                       ▼  
              Begin Transaction  
                       │  
                       ▼  
     ┌──────────────────────────────────┐  
     │      SAME DATABASE TRANSACTION   │  
     │──────────────────────────────────│  
     │ Business Data                    │  
     │ Audit Log                        │  
     │ Canonical Domain Event           │  
     │ Event Outbox                     │  
     └──────────────────────────────────┘  
                       │  
                       ▼  
                    COMMIT  
                       │  
                       ▼  
              Outbox Processor  
                       │  
                       ▼  
                  Event Bus  
                       │  
       ┌───────────────┼───────────────────┐  
       ▼               ▼                   ▼  
Internal Modules  Integration Adapters  Future Consumers

This is the canonical propagation model for every Business Operation.

---

# **Responsibilities**

Rather than treating event processing as one component, Atlas separates it into distinct responsibilities.

## **Business Transaction**

Responsible for:

* Business validation  
* Database updates  
* Audit logging  
* Creating the canonical Domain Event  
* Writing the Outbox record

It **never** publishes events directly.

---

## **Event Outbox**

The Outbox acts as the durable handoff between synchronous and asynchronous execution.

Responsibilities:

* Store pending Domain Events atomically with business data.  
* Guarantee that every committed Business Operation has a corresponding event.  
* Persist events until successfully processed.

The Outbox is part of the database transaction.

---

## **Outbox Processor**

The Outbox Processor is responsible for operational reliability.

Responsibilities:

* Read pending events.  
* Lock and claim events safely.  
* Retry failed processing.  
* Move unrecoverable events to a dead-letter state.  
* Ensure no committed event is permanently lost.

The Outbox Processor knows nothing about business domains.

It only manages event delivery.

---

## **Event Bus**

The Event Bus is responsible for distribution.

Responsibilities:

* Receive published Domain Events from the Outbox Processor.  
* Route events to all interested subscribers.  
* Remain independent of business logic.  
* Allow new consumers without modifying producers.

The Event Bus does not retry failed business operations.

Its responsibility is routing, not persistence.

---

# **Consumer Independence**

Consumers execute independently.

invoice.finalized  
       │  
       ├── Analytics          ✔  
       ├── Workflow           ✔  
       ├── Notification       ✖  
       ├── AI                 ✔  
       └── Shopify Adapter    ✔

A failure in one consumer never affects:

* the committed Business Operation  
* other consumers  
* the Event Bus

Only the failed consumer retries.

---

# **Event Processing Guarantees**

Atlas guarantees:

✓ Every committed Business Operation creates an Outbox record.

✓ Every Outbox record is eventually processed.

✓ Consumers operate independently.

✓ Failed consumers can retry safely.

Atlas does **not** guarantee:

* Immediate delivery.  
* Simultaneous execution.  
* Exactly-once delivery across distributed systems.

Instead, Atlas guarantees **reliable eventual propagation**.

---

# **Retry Lifecycle**

Every Outbox event follows a defined lifecycle.

PENDING  
   │  
   ▼  
CLAIMED  
   │  
   ▼  
DISPATCHING  
   │  
   ▼  
DISPATCHED

If processing fails:

PENDING  
   │  
   ▼  
CLAIMED  
   │  
   ▼  
FAILED  
   │  
   ▼  
Retry  
   │  
   ▼  
CLAIMED

After the retry policy is exhausted:

FAILED  
   │  
   ▼  
DEAD LETTER

Dead-letter events remain available for operational investigation and replay.

---

# **Architectural Separation**

One of the key architectural decisions in Atlas is the separation of concerns.

| Component | Responsibility |
| ----- | ----- |
| **Business Operation** | Produce business data and the canonical Domain Event. |
| **Event Outbox** | Persist events atomically with business data. |
| **Outbox Processor** | Reliably recover and process pending events. |
| **Event Bus** | Distribute events to subscribers. |
| **Consumers** | Execute independent business reactions. |

Each component has exactly one responsibility.

---

# **Architectural Principles**

### **EV-007 — Transactional Event Creation**

Every Domain Event must be written to the Event Outbox within the same transaction as the Business Operation.

---

### **EV-008 — Commit Before Propagation**

Events become eligible for propagation only after the originating transaction commits successfully.

---

### **EV-009 — Reliable Event Recovery**

The Outbox Processor is responsible for ensuring that committed events are eventually propagated, even after application failures or restarts.

---

### **EV-010 — Independent Event Distribution**

The Event Bus distributes events without knowledge of subscriber implementation or business logic.

Publishers and consumers remain completely decoupled.

---

### **EV-011 — Independent Consumers**

Each consumer processes events independently.

Failures in one consumer must never affect other consumers or the originating Business Operation.

---

### **EV-012 — Eventual Consistency**

Asynchronous consumers eventually converge with the committed business state through reliable event propagation and retry mechanisms.

But I think we accidentally drifted slightly toward implementation.

For example:

Outbox Processor

Event Bus

These are good architectural responsibilities, but I would avoid making them sound like concrete deployable components.

Instead, I'd present them as **logical responsibilities**.

For example:

Propagation Layer

Responsibilities

• Recover events  
• Route events  
• Retry failures  
• Track delivery

Then later, during implementation, that Propagation Layer could become:

* One NestJS service  
* Multiple workers  
* Kafka  
* RabbitMQ

The architecture stays implementation-neutral.

## **Objective**

Define the canonical structure, identity, and metadata of every Domain Event published within Atlas.

This chapter establishes a single event contract that all business domains, internal platform components, and external integrations must follow. By enforcing one consistent event format, Atlas ensures interoperability, traceability, version compatibility, and long-term maintainability across the platform.

---

# **Core Principle**

Every completed Business Operation produces exactly one **canonical Domain Event**.

Every Domain Event follows the same structural contract regardless of its originating domain.

Sales events, Inventory events, Purchasing events, Workflow events, AI events, and future integrations all speak the same language.

Consumers never infer event structure from the producer.

They rely on the canonical Event Contract.

---

# **Canonical Event Structure**

Every Domain Event consists of three logical sections:

Event  
│  
├── Identity  
├── Context  
└── Business Payload

Each section has a distinct responsibility.

| Section | Responsibility |
| ----- | ----- |
| Identity | Uniquely identifies the event and its type. |
| Context | Describes where, when, and why the event occurred. |
| Business Payload | Contains the immutable business facts associated with the completed operation. |

This separation allows infrastructure metadata to evolve independently from business data while preserving a stable event contract.

---

# **Event Identity**

Every event is globally unique.

The identity portion of the contract contains the information required to distinguish one business fact from every other event ever produced by Atlas.

Mandatory fields include:

| Field | Purpose |
| ----- | ----- |
| `event_id` | Globally unique identifier for the event. |
| `event_type` | Canonical business event name. |
| `event_version` | Contract version of the event. |

### **Event Identifier**

`event_id` is immutable.

Once published, it never changes.

It is the primary reference used by:

* Outbox processing  
* Consumer deduplication  
* Audit  
* Monitoring  
* Event replay  
* External integrations

---

# **Event Context**

Context describes the circumstances under which the business fact occurred.

Mandatory contextual information includes:

| Field | Purpose |
| ----- | ----- |
| `business_id` | Tenant that owns the event. |
| `aggregate_type` | Business entity responsible for the event. |
| `aggregate_id` | Identifier of the affected business entity. |
| `occurred_at` | Time the business fact became true. |
| `source_domain` | Domain that owns and published the event. |

Context allows every consumer to understand the event without requiring direct communication with the producing service.

---

# **Correlation & Causation**

Business operations often generate chains of related events.

Atlas distinguishes between:

### **Correlation**

Correlation identifies the complete business operation.

Example:

Create Invoice

↓

invoice.finalized

↓

notification.sent

↓

analytics.updated

↓

workflow.started

Every event generated from this operation shares the same **Correlation ID**.

This enables complete end-to-end tracing.

---

### **Causation**

Causation identifies the immediate predecessor responsible for the current event.

Example:

invoice.finalized  
       │  
       ▼  
workflow.started  
       │  
       ▼  
notification.sent

The Notification event records the Workflow event as its cause.

Together, Correlation and Causation allow Atlas to reconstruct complete event histories without creating direct dependencies between services.

---

# **Business Payload**

The payload contains the immutable business facts associated with the completed operation.

Examples include:

* invoice identifier  
* customer identifier  
* payment amount  
* stock quantity  
* workflow identifier

The payload must describe **what happened**, not what consumers should do.

Correct:

invoice.finalized

Payload:

invoice\_id  
customer\_id  
total\_amount  
currency

Incorrect:

send\_email \= true

Consumer-specific instructions never belong inside the payload.

---

# **Event Versioning**

Every Domain Event includes an explicit version.

Versioning allows Atlas to evolve event contracts while preserving compatibility with existing consumers.

Version changes occur only when the event contract changes in a backward-incompatible manner.

Changes such as additional optional fields do not require a new version.

Consumers must rely on the declared event version rather than assuming the latest schema.

---

# **Event Immutability**

Once published, a Domain Event becomes an immutable business record.

Events are never modified, replaced, or deleted to reflect later business changes.

If business state changes again, Atlas publishes a new Domain Event describing the new fact.

For example:

invoice.created

↓

invoice.finalized

↓

invoice.cancelled

Each event represents a distinct point in business history.

Together they form a complete, auditable sequence of business facts.

---

# **Event Contract Independence**

The Event Contract defines **what** an event is.

It does not define:

* how events are stored  
* how events are published  
* how retries occur  
* how consumers process events  
* how integrations transform events

These concerns belong to subsequent chapters.

By separating the Event Contract from its delivery mechanism, Atlas ensures that business communication remains stable even as infrastructure evolves.

---

# **Architectural Principles**

### **EVT-011 — Canonical Event Contract**

Every Domain Event must conform to the Atlas Event Contract regardless of its originating domain.

---

### **EVT-012 — Globally Unique Identity**

Every Domain Event possesses a globally unique, immutable identity that remains constant throughout its lifetime.

---

### **EVT-013 — Immutable Business Facts**

Published Domain Events are immutable and permanently represent completed business facts.

---

### **EVT-014 — Context Before Payload**

Every Domain Event must include sufficient contextual metadata to be understood independently of its producer.

---

### **EVT-015 — Versioned Contracts**

All Domain Events are explicitly versioned to support long-term evolution while maintaining consumer compatibility.

# Chapter 4.3 — Transactional Outbox Architecture

## **Objective**

Define how Atlas guarantees reliable publication of Domain Events without compromising transactional consistency.

This chapter establishes the **Transactional Outbox Pattern** as the only supported mechanism for publishing Domain Events, ensuring that business data and event publication remain permanently consistent.

---

# **Core Principle**

A Domain Event is considered part of the Business Operation.

Therefore, recording the event must succeed or fail together with the business data.

Atlas never publishes Domain Events directly from the Business Operation.

Instead, every completed Business Operation records its Domain Event in the Outbox as part of the same database transaction.

Only after the transaction commits successfully may the event be published to downstream consumers.

---

# **Why the Outbox Exists**

A common implementation is:

Begin Transaction  
       │  
       ▼  
Save Invoice  
       │  
       ▼  
Commit  
       │  
       ▼  
Publish Event

This introduces a critical failure window.

If the application crashes after the database commit but before the event is published:

* The invoice exists.  
* No Domain Event is published.  
* Analytics never update.  
* Notifications are never sent.  
* Workflow never starts.  
* External integrations remain unaware.

The platform becomes permanently inconsistent.

Atlas does not permit this failure mode.

---

# **Atomic Business Commit**

Atlas treats business data and its corresponding Domain Event as one atomic unit.

Every Business Operation follows the same transactional pattern.

Begin Transaction  
       │  
       ├── Business Data  
       ├── Audit Log  
       ├── Domain Event  
       └── Outbox Record  
       │  
       ▼  
Commit

Either all records are committed together or none are committed.

No successful Business Operation may exist without its corresponding Outbox record.

---

# **The Outbox Is Infrastructure**

The Outbox is **not** part of the business domain.

It is an infrastructure component responsible for guaranteeing reliable event delivery.

Business domains never interact directly with event dispatching mechanisms.

Their responsibility ends after recording the canonical Domain Event inside the active Unit of Work.

The infrastructure layer assumes responsibility only after the transaction commits successfully.

This separation preserves a clean boundary between business logic and messaging infrastructure.

---

# **Publication Lifecycle**

Once the transaction commits, responsibility transfers to the Event Dispatcher.

The publication flow becomes:

Business Operation  
       │  
       ▼  
Database Transaction  
       │  
       ├── Business Data  
       ├── Audit  
       ├── Domain Event  
       └── Outbox  
       │  
       ▼  
Commit  
       │  
       ▼  
Event Dispatcher  
       │  
       ▼  
Consumers

The Business Operation never waits for consumers to finish.

Its responsibility ends at a successful commit.

---

# **Exactly One Outbox Record per Domain Event**

Each canonical Domain Event produces exactly one corresponding Outbox record.

This establishes a one-to-one relationship between the event store and the delivery mechanism.

The Outbox does not generate new business events.

It merely schedules reliable publication of existing Domain Events.

---

# **Separation of Responsibilities**

Each component owns a distinct responsibility.

| Component | Responsibility |
| ----- | ----- |
| Application Service | Execute the Business Operation. |
| Unit of Work | Persist all business changes atomically. |
| Domain Event | Record the completed business fact. |
| Outbox | Guarantee reliable publication. |
| Event Dispatcher | Publish committed events. |
| Consumers | React independently to published events. |

No component assumes another's responsibility.

---

# **Business Consistency Boundary**

The database transaction defines the boundary of business correctness.

Everything inside the transaction is business-critical.

Examples include:

* Business aggregates  
* Inventory movements  
* Ledger entries  
* Audit records  
* Domain Events  
* Outbox records

Everything outside the transaction is eventually consistent.

Examples include:

* Notifications  
* Analytics  
* AI processing  
* Workflow execution  
* Webhooks  
* Third-party integrations

This boundary ensures that failures in downstream processing never invalidate completed business operations.

---

# **Recovery Model**

If publication fails after the transaction commits:

* Business data remains correct.  
* Domain Events remain stored.  
* Outbox records remain available.  
* Publication can safely resume later.

Recovery never requires recreating the Business Operation.

The Outbox serves as the durable source of pending publications until successful delivery is confirmed.

---

# **Architectural Principles**

### **EVT-016 — Atomic Event Recording**

Every Business Operation must persist its Domain Event and corresponding Outbox record within the same Unit of Work.

---

### **EVT-017 — Reliable Publication**

Domain Events are published only after the successful commit of the Business Operation.

---

### **EVT-018 — Infrastructure Separation**

Business domains never publish events directly.

Reliable event publication is the responsibility of the infrastructure layer.

---

### **EVT-019 — Single Publication Source**

The Transactional Outbox is the only supported source for publishing Domain Events.

---

### **EVT-020 — Consistency Before Communication**

Business correctness always takes precedence over asynchronous communication.

Failures in downstream processing must never compromise committed business transactions.

# **Chapter 4.4 — Event Consumption**

## **Objective**

Define how Atlas components consume Domain Events in a reliable, independent, and eventually consistent manner.

This chapter establishes the architectural rules governing event consumers, ensuring that downstream processing remains resilient, scalable, and isolated from the originating Business Operation.

---

# **Core Principle**

Publishing a Domain Event completes the responsibility of the producing domain.

Every subsequent action is performed independently by one or more Event Consumers.

Consumers observe completed business facts.

They never participate in the originating Business Operation.

---

# **Independent Consumers**

Each consumer owns a single responsibility.

A published Domain Event may be processed by any number of independent consumers.

For example:

invoice.finalized  
       │  
       ├── Analytics Consumer  
       ├── Notification Consumer  
       ├── Workflow Consumer  
       ├── AI Consumer  
       └── Integration Consumer

Each consumer decides independently whether the event is relevant.

No consumer knows whether another consumer exists.

---

# **Consumer Isolation**

Consumers never communicate with each other.

For example:

Analytics

↓

Notification

is **not allowed**.

Instead:

invoice.finalized

↓

Analytics

invoice.finalized

↓

Notification

Every consumer reacts directly to the canonical Domain Event.

This prevents hidden dependencies between platform capabilities.

---

# **Eventual Consistency**

Consumer processing occurs **after** the originating transaction has committed.

Therefore:

* notifications  
* analytics  
* AI  
* workflow  
* webhooks  
* integrations

are eventually consistent.

Temporary failures do not invalidate completed Business Operations.

Business correctness is established at commit.

Consumers improve the system state afterward.

---

# **Idempotent Processing**

Consumers must tolerate duplicate event delivery.

A consumer must produce the same final state whether it processes an event:

* once,  
* twice,  
* or multiple times.

Example:

invoice.finalized

↓

Update Analytics

If the same event is received again:

Analytics should not be counted twice.

The consumer must recognize that the event has already been processed.

Duplicate delivery is considered a normal operating condition, not an error.

---

# **Consumer Failures**

A failure inside one consumer affects only that consumer.

Example:

invoice.finalized  
       │  
       ├── Analytics ✅  
       ├── Notification ❌  
       ├── Workflow ✅  
       └── AI ✅

The failed Notification Consumer may retry later.

The successful consumers remain unaffected.

Atlas never rolls back completed consumer work because another consumer failed.

---

# **Retry Strategy**

Transient failures are resolved through retries.

Examples include:

* temporary network outages  
* external API downtime  
* short-lived infrastructure failures  
* rate limiting

Retries always operate on the original Domain Event.

The Business Operation is never repeated.

---

# **Dead-Letter Handling**

Some failures cannot be resolved through retries.

Examples include:

* permanently invalid payloads  
* removed integrations  
* incompatible external systems  
* corrupted external configuration

After exhausting retry policies, the event moves to a Dead-Letter state for operational investigation.

The original Domain Event remains preserved.

No business data is lost.

---

# **Ordering Guarantees**

Atlas guarantees ordering only where business correctness requires it.

Events belonging to the same aggregate should be processed in publication order.

Example:

invoice.created

↓

invoice.finalized

↓

invoice.cancelled

Consumers should observe these events in sequence.

Events belonging to unrelated aggregates may be processed concurrently.

This maximizes scalability without sacrificing correctness.

---

# **Execution Context**

Every consumer reconstructs a valid Execution Context before accessing business data.

The context is derived from trusted information contained within the Domain Event.

Consumer execution therefore follows the same security model as:

* HTTP requests  
* AI  
* Background Workers  
* Workflow Engine

Consumers never bypass Row-Level Security merely because they execute asynchronously.

This remains consistent with the execution model defined earlier in the architecture.

---

# **Consumer Responsibilities**

A consumer may:

* update its own projections  
* create derived data  
* trigger automation  
* notify external systems  
* generate analytics  
* invoke AI services

A consumer must never:

* modify the originating transaction  
* rewrite the published Domain Event  
* assume exclusive ownership of an event  
* introduce direct dependencies on other consumers

Consumers react.

They do not coordinate.

---

# **Architectural Principles**

### **EVT-021 — Independent Consumption**

Every Event Consumer operates independently from all other consumers.

---

### **EVT-022 — Eventual Consistency**

Consumer processing occurs only after successful transaction commit and does not participate in the originating Business Operation.

---

### **EVT-023 — Idempotent Consumers**

Every consumer must safely tolerate duplicate event delivery without producing duplicate business effects.

---

### **EVT-024 — Failure Isolation**

Failure of one consumer must never prevent other consumers from processing the same Domain Event.

---

### **EVT-025 — Contextual Execution**

Every consumer reconstructs a valid Execution Context before accessing tenant-scoped data and remains subject to Row-Level Security.

---

### **EVT-026 — Event-Centric Communication**

Consumers communicate through Domain Events rather than direct dependencies on other consumers.

# **Chapter 4.5 — Integration Architecture & Architectural Laws**

## **Objective**

Define how Atlas exposes its canonical Domain Events to external systems while preserving the integrity of the internal event model.

This chapter establishes the boundary between Atlas and third-party platforms, ensuring that integrations remain isolated from the core business domains and that Atlas maintains a single canonical language for all business events.

---

# **Core Principle**

Atlas never changes its internal event model to satisfy external systems.

Every Business Operation publishes a canonical Domain Event.

External systems receive translated representations of that event through dedicated Integration Adapters.

Atlas owns its event language.

Integrations adapt to Atlas—not the other way around.

---

# **Integration Adapters**

Integration Adapters act as translators between the Atlas event model and external platforms.

For example:

invoice.finalized  
       │  
       ▼  
Integration Adapter  
       │  
       ├── WhatsApp  
       ├── Razorpay  
       ├── Shopify  
       ├── QuickBooks  
       ├── Tally  
       └── Webhooks

Each adapter is responsible for transforming the canonical event into the format required by its target platform.

Business domains never communicate directly with third-party APIs.

---

# **Internal vs External Consumers**

Atlas makes no distinction when publishing Domain Events.

Both internal capabilities and external integrations subscribe to the same canonical event stream.

invoice.finalized  
       │  
       ├── Analytics  
       ├── Workflow  
       ├── AI  
       ├── Notifications  
       └── Integration Adapters

The difference lies only in what each consumer does with the event.

This keeps the platform extensible without increasing coupling.

---

# **Translation Responsibility**

Only Integration Adapters may transform Domain Events.

For example:

Atlas Event

invoice.finalized

↓

Shopify API

↓

{  
 "order\_status": "completed"  
}

or

↓

WhatsApp Template

↓

Your invoice INV-1025 has been finalized.

The original Atlas Domain Event remains unchanged.

This ensures that business meaning is preserved while allowing each external platform to receive the representation it expects.

---

# **Webhooks**

Outbound webhooks follow the same architecture.

They are consumers of Domain Events.

Example:

invoice.finalized  
       │  
       ▼  
Webhook Adapter  
       │  
       ▼  
POST https://customer.example/webhook

Webhooks are infrastructure concerns.

They never participate in the originating Business Operation.

---

# **Future Integrations**

New integrations should require **no changes** to existing business domains.

Adding a new platform should involve only:

1. Subscribing to existing Domain Events.  
2. Translating those events.  
3. Delivering them to the external system.

Existing producers remain unchanged.

This follows the Open/Closed Principle and allows Atlas to evolve without modifying stable business logic.

---

# **Architectural Boundaries**

The responsibilities are intentionally separated.

| Component | Responsibility |
| ----- | ----- |
| Business Domain | Publish canonical Domain Events |
| Event Contract | Define the business language |
| Outbox | Guarantee reliable publication |
| Event Dispatcher | Deliver published events |
| Event Consumers | React to business facts |
| Integration Adapter | Translate events for external systems |

No layer performs another layer's responsibility.

---

# **Architectural Principles**

### **EVT-027 — Canonical Business Language**

Atlas maintains a single canonical event language for all business communication.

---

### **EVT-028 — Producer Independence**

Business domains remain completely independent of consumers and external integrations.

---

### **EVT-029 — Translation at the Edge**

Transformation into third-party formats occurs exclusively within Integration Adapters.

Canonical Domain Events are never modified to satisfy external systems.

---

### **EVT-030 — Consumer Extensibility**

New consumers and integrations may be introduced without modifying existing event producers.

---

### **EVT-031 — Infrastructure Isolation**

Delivery mechanisms, webhooks, messaging protocols, and third-party APIs belong to the infrastructure layer and never become part of the business domain.

# Chapter 5 — Database Automation Policy

## **Chapter 5.1 — Philosophy & Responsibilities**

## **Objective**

Define the architectural boundary between PostgreSQL and the Atlas application.

This chapter establishes what responsibilities belong to the database and what responsibilities belong to the application layer, ensuring that automation remains predictable, maintainable, and free of hidden business behavior.

---

# **Core Principle**

Atlas treats PostgreSQL as a **data integrity engine**, not a business logic engine.

The database is responsible for protecting data consistency and enforcing structural rules.

The application is responsible for executing business operations, coordinating workflows, and making business decisions.

This separation ensures that business behavior remains explicit, testable, and independent of database implementation details.

---

# **Separation of Responsibilities**

Atlas divides responsibilities into two distinct layers.

## **PostgreSQL Responsibilities**

PostgreSQL guarantees that stored data remains structurally correct.

Its responsibilities include:

* enforcing constraints  
* maintaining referential integrity  
* applying Row-Level Security  
* generating deterministic values  
* maintaining lightweight infrastructure automation  
* executing deterministic helper functions

These responsibilities are independent of business intent.

They remain valid regardless of how the application evolves.

---

## **Application Responsibilities**

The application owns every business operation.

Examples include:

* creating invoices  
* receiving payments  
* adjusting inventory  
* posting ledger entries  
* executing workflows  
* publishing Domain Events  
* generating analytics  
* invoking AI capabilities  
* communicating with external systems

These operations require business knowledge and frequently span multiple domains.

They therefore belong outside the database.

---

# **Why Atlas Minimizes Database Automation**

Hidden automation increases coupling between the application and the database.

Consider the following example.

INSERT invoice

↓

Database Trigger

↓

Decrease Inventory

↓

Create Ledger Entry

↓

Publish Event

Although only one SQL statement is visible, several independent business actions occur implicitly.

This creates hidden execution paths that are difficult to:

* understand  
* debug  
* test  
* version  
* migrate  
* extend

Business behavior should never depend on implicit database side effects.

Instead, Atlas makes every business operation explicit within the Application Service.

Create Invoice

↓

Validate Business Rules

↓

Create Invoice

↓

Create Stock Movements

↓

Create Ledger Entries

↓

Create Audit Record

↓

Create Domain Event

↓

Commit

Every step is visible, intentional, and executed within a single Unit of Work.

---

# **Deterministic vs Business Automation**

Atlas distinguishes between two categories of automation.

### **Deterministic Automation**

Deterministic automation always produces the same result from the same input.

Examples include:

* generating UUIDs  
* updating timestamps  
* enforcing constraints  
* computed columns  
* helper functions  
* Row-Level Security evaluation

These operations contain no business decisions.

They are safe to execute within PostgreSQL.

---

### **Business Automation**

Business automation requires interpreting business rules or coordinating multiple domains.

Examples include:

* inventory allocation  
* invoice approval  
* payment reconciliation  
* workflow execution  
* notification delivery  
* analytics generation  
* AI processing

These operations depend on business context.

They belong exclusively to the application layer.

---

# **Architectural Boundary**

The boundary between PostgreSQL and the application can be summarized as follows.

| Concern | PostgreSQL | Application |
| ----- | ----- | ----- |
| Data Integrity | ✅ | ❌ |
| Constraints | ✅ | ❌ |
| Foreign Keys | ✅ | ❌ |
| Row-Level Security | ✅ | ❌ |
| Default Values | ✅ | ❌ |
| Generated Columns | ✅ | ❌ |
| Lightweight Helper Functions | ✅ | ❌ |
| Business Rules | ❌ | ✅ |
| Cross-Domain Coordination | ❌ | ✅ |
| Domain Events | ❌ | ✅ |
| Workflow | ❌ | ✅ |
| Notifications | ❌ | ✅ |
| AI | ❌ | ✅ |
| External Integrations | ❌ | ✅ |

This boundary is intentionally strict.

It ensures that PostgreSQL remains responsible for **protecting data**, while the application remains responsible for **running the business**.

---

# **Benefits of This Architecture**

By limiting database automation, Atlas achieves several architectural advantages:

* Business logic is centralized within the application.  
* Database behavior remains predictable and transparent.  
* Business operations are easier to test and debug.  
* Infrastructure can evolve independently of business rules.  
* Database migrations remain safer and easier to reason about.  
* New integrations and workflows can be introduced without modifying database behavior.

Most importantly, every business operation has a single, explicit implementation path.

---

# **Architectural Principles**

### **DBA-001 — Integrity Before Automation**

PostgreSQL is responsible for enforcing data integrity, not executing business workflows.

---

### **DBA-002 — Explicit Business Logic**

Business rules and business decisions must reside exclusively within the application layer.

---

### **DBA-003 — Deterministic Database Behavior**

Database automation must produce deterministic results without interpreting business intent.

---

### **DBA-004 — No Hidden Side Effects**

A database operation must never trigger implicit business operations that are not explicitly visible within the Business Operation.

---

### **DBA-005 — Clear Responsibility Boundaries**

Responsibilities between PostgreSQL and the application must remain explicit, stable, and non-overlapping.

# **Chapter 5.2 — Permitted Database Automation**

## **Objective**

Define the limited set of responsibilities that PostgreSQL is permitted to automate within the Atlas platform.

This chapter establishes a conservative automation policy that leverages PostgreSQL for infrastructure concerns while ensuring that all business behavior remains within the application layer.

---

# **Core Principle**

PostgreSQL may automate only **deterministic infrastructure responsibilities**.

Automation is permitted when it improves data integrity, consistency, or maintainability without requiring business knowledge or creating hidden behavior.

---

# **Permitted Database Automation**

Atlas permits PostgreSQL to automate only the following categories:

* Data integrity (constraints, foreign keys, uniqueness, check constraints)  
* Deterministic default values (UUIDs, timestamps, default constants)  
* Generated columns and computed values  
* Lightweight triggers for infrastructure concerns (for example, maintaining `updated_at`)  
* Helper functions supporting reusable SQL logic and Row-Level Security  
* Other deterministic database features that do not introduce business behavior

These forms of automation are considered part of the database infrastructure rather than the business domain.

---

# **Characteristics of Permitted Automation**

Every permitted automation must satisfy all of the following principles:

| Characteristic | Requirement |
| ----- | ----- |
| **Deterministic** | Produces the same result for the same input. |
| **Local** | Operates only on the current row or transaction. |
| **Infrastructure-Oriented** | Supports storage, integrity, or database operation rather than business workflows. |
| **Side-Effect Free** | Does not initiate additional business operations or external communication. |
| **Business-Agnostic** | Does not interpret or enforce business rules. |

If an automation violates any of these characteristics, it belongs in the application layer.

---

# **Architectural Boundary**

Permitted database automation exists to protect and maintain data—not to run the business.

Whenever an operation requires business decisions, coordinates multiple domains, or produces business outcomes, responsibility shifts from PostgreSQL to the Application Service.

This boundary keeps business behavior explicit, testable, and consistent across the Atlas platform.

# **Chapter 5.3 — Prohibited Database Automation**

## **Objective**

Define the categories of automation that must never be implemented within PostgreSQL.

This chapter protects the architectural boundary established in previous chapters by ensuring that business behavior remains explicit, centralized, and coordinated within the application layer.

---

# **Core Principle**

If an operation requires business knowledge, coordinates multiple domains, or produces business outcomes, it must not execute inside PostgreSQL.

Business operations belong exclusively to the Application Service, where they remain visible, testable, and part of a controlled Unit of Work.

---

# **Prohibited Database Automation**

Atlas prohibits PostgreSQL from automating:

* Business rule evaluation  
* Cross-domain coordination  
* Business workflow execution  
* Domain Event publication  
* Inventory adjustments  
* Ledger posting  
* Notification delivery  
* Analytics generation  
* AI processing  
* External API communication  
* Integration synchronization

These operations require business context and frequently involve multiple domains or external systems.

They therefore belong exclusively to the application layer.

---

# **Hidden Business Behavior**

Database automation must never create business behavior that is invisible to the application.

For example:

INSERT Invoice

↓

Trigger

↓

Update Inventory

↓

Create Ledger Entry

↓

Publish Event

Although only one database operation appears to occur, several business operations are executed implicitly.

This violates Atlas's principles of explicit business logic, transaction ownership, and service orchestration.

Instead, every business operation should follow the application execution pipeline.

Application Service

↓

Validate Business Rules

↓

Execute Domain Services

↓

Persist Changes

↓

Create Domain Event

↓

Commit

Every business action remains explicit and participates in the same Unit of Work.

---

# **Architectural Boundary**

PostgreSQL protects data.

The application runs the business.

Whenever an automation requires interpreting business intent rather than maintaining database integrity, responsibility shifts to the application layer.

This boundary prevents hidden side effects, preserves transactional clarity, and keeps business logic centralized within the domain model.

---

## **Transition**

The database automation policy is now complete.

The next chapter shifts from **"What may the database automate?"** to **"How long does data live?"**

This introduces:

* immutable records  
* soft deletion  
* archival  
* retention  
* cleanup  
* backups

as part of the overall Data Lifecycle Architecture.

# **Chapter 5.4 — Architectural Principles & Laws**

## **Objective**

Define the fundamental principles governing database automation within Atlas.

These principles ensure that PostgreSQL remains responsible for data integrity while the application layer remains responsible for business behavior.

---

# **Architectural Principles**

### **DBA-001 — Integrity Before Automation**

The primary responsibility of PostgreSQL is to protect data integrity.

Database automation must never compromise correctness for convenience.

---

### **DBA-002 — Business Logic Resides in the Application**

Business rules, business decisions, and business workflows must execute exclusively within the application layer.

PostgreSQL must not become a business execution engine.

---

### **DBA-003 — Deterministic Automation Only**

Database automation must be deterministic.

Given the same input, it must always produce the same result without interpreting business intent.

---

### **DBA-004 — No Hidden Business Behavior**

Database operations must not implicitly trigger additional business operations.

Business behavior should remain explicit within the Application Service coordinating the Business Operation.

---

### **DBA-005 — Infrastructure Over Orchestration**

PostgreSQL may automate infrastructure responsibilities such as data integrity, generated values, and lightweight maintenance.

Business orchestration remains the responsibility of the application.

---

### **DBA-006 — Local Scope**

Database automation must operate only within the scope of the current transaction and its affected data.

Automation must never coordinate multiple business domains or external systems.

---

### **DBA-007 — Single Source of Business Decisions**

Every business decision must have a single authoritative implementation within the application layer.

Database automation must never duplicate or reinterpret business rules.

# Chapter 6 — Data Lifecycle & Retention

## **Objective**

Define how Atlas classifies, retains, and manages data throughout its lifetime.

This chapter establishes lifecycle policies based on **data categories** rather than individual tables, ensuring consistent behavior across all domains as the platform evolves.

---

## **Chapter Structure**

### **6.1 Data Classification**

Defines the categories of data managed by Atlas.

Example categories:

| Category | Purpose |
| ----- | ----- |
| Business Data | Core business records |
| Financial Data | Accounting and ledger records |
| Operational Data | Workflows, notifications, jobs |
| Temporary Data | Sessions, OTPs, tokens |
| Derived Data | Analytics, projections, caches |
| Configuration Data | Settings and feature flags |

**Decision:**

Every table belongs to exactly one lifecycle category.

Lifecycle policies apply to categories, not individual tables.

---

### **6.2 Lifecycle Policies**

Defines the lifecycle rules for each category.

| Category | Mutable | Archive | Delete | Retention |
| ----- | ----- | ----- | ----- | ----- |
| Business Data | Limited | Optional | ❌ | Permanent |
| Financial Data | ❌ | Optional | ❌ | Permanent |
| Operational Data | ✅ | Optional | Configurable | Configurable |
| Temporary Data | ✅ | ❌ | Auto Expire | Short-lived |
| Derived Data | Rebuildable | ❌ | ✅ | Configurable |
| Configuration Data | ✅ | Optional | ❌ | Permanent |

Additional policies:

* Business and financial records are preserved for traceability.  
* Temporary data expires automatically according to retention policies.  
* Derived data may be safely regenerated.  
* Cleanup workers remove expired temporary data.  
* Backup and recovery preserve all retained data independently of lifecycle policies.

---

### **6.3 Architectural Principles**

### **DLC-001 — Category-Based Lifecycle**

Lifecycle policies are defined by data category rather than individual tables.

---

### **DLC-002 — Preserve Business History**

Business and financial records must remain available for auditability and historical traceability.

---

### **DLC-003 — Temporary Data Expires**

Temporary operational data is automatically removed according to its retention policy.

---

### **DLC-004 — Derived Data Is Rebuildable**

Derived data may be regenerated from authoritative business records and therefore does not require permanent retention.

---

### **DLC-005 — Retention Before Deletion**

Data must follow its defined retention policy before archival or deletion.

# Chapter 7 — Performance Architecture

# **7.1 Performance Strategy**

## **Objective**

Define how Atlas approaches performance optimization.

---

## **Core Principle**

Atlas prioritizes **correctness**, **security**, and **maintainability** before performance.

Optimization is introduced only when supported by measurable requirements and must never compromise architectural boundaries or business correctness.

Performance is achieved through deliberate architectural decisions rather than premature optimization.

---

## **Performance Strategy**

Atlas follows these principles:

* Optimize only demonstrated bottlenecks.  
* Prefer simple solutions over unnecessary complexity.  
* Preserve transactional consistency and security during optimization.  
* Scale the architecture before increasing implementation complexity.

---

# **7.2 Optimization Policies**

Performance improvements must align with the following architectural policies.

| Category | Policy |
| ----- | ----- |
| **Storage** | Model data for correctness first. Introduce storage optimizations only when justified by measurable needs. |
| **Queries** | Optimize common access patterns without sacrificing maintainability or readability. |
| **Derived Data** | Use projections, caches, and snapshots only for data that can be regenerated from authoritative sources. |
| **Scaling** | Prefer scaling stateless application components before introducing additional database complexity. |
| **Optimization** | Every optimization must provide measurable benefit while preserving architectural boundaries. |

These policies intentionally describe **architectural decisions** rather than implementation techniques, allowing Atlas to evolve without changing its architectural foundation.

---

# **7.3 Architectural Principles**

### **PERF-001 — Correctness Before Performance**

Business correctness always takes precedence over performance optimization.

---

### **PERF-002 — Measure Before Optimize**

Performance improvements must be driven by measurable requirements rather than assumptions.

---

### **PERF-003 — Preserve Architectural Boundaries**

Optimization must not bypass security, transaction boundaries, or domain responsibilities.

---

### **PERF-004 — Derived Data Is Reproducible**

Caches, projections, and other derived data must always be reproducible from authoritative business records.

*Exception: Synchronous projections (like the `inventory` table) that serve as hard business invariants to prevent race conditions must be updated inside the ACID transaction, separating them from eventually consistent derived data like analytics.*

---

### **PERF-005 — Simplicity Over Complexity**

Atlas favors simple, maintainable solutions unless additional complexity provides clear and measurable value.

# Chapter 8 — Schema Evolution

# **8.1 Evolution Policies**

Atlas treats the database schema as a version-controlled architectural asset that evolves incrementally over time.

Schema evolution follows the following policies.

| Category | Policy |
| ----- | ----- |
| **Schema Changes** | All schema modifications are introduced through managed, version-controlled migrations. |
| **Compatibility** | Schema evolution should preserve backward compatibility whenever practical. |
| **Data Preservation** | Existing business data must remain protected throughout schema evolution unless an explicit migration defines otherwise. |
| **Recoverability** | Every schema change must support a defined recovery strategy. |

These policies ensure that Atlas can evolve safely while preserving data integrity and system stability.

---

# **8.2 Architectural Principles**

### **SCH-001 — Controlled Schema Evolution**

Database schema changes must occur only through managed migrations.

---

### **SCH-002 — Preserve Existing Data**

Schema evolution must protect existing business data unless an intentional migration explicitly defines otherwise.

---

### **SCH-003 — Backward Compatibility**

Schema evolution should preserve compatibility whenever practical to support safe application evolution.

---

### **SCH-004 — Recoverability**

Every schema change must include a defined recovery strategy.

# Chapter 9 — Application Architecture

**Chapter 9.1 — Application Philosophy**

## **Objective**

Define how Atlas executes Business Operations while maintaining clear separation of responsibilities between architectural layers.

---

# **Core Principles**

* Business Operations are the unit of execution.  
* The Application Layer coordinates Business Operations.  
* Business rules belong to the Domain Layer.  
* Persistence belongs to the Persistence Layer.  
* Infrastructure supports the application but never defines business behavior.  
* Every execution follows the same application lifecycle.  
* Architectural responsibilities must never overlap.

---

# **Application Layer Responsibilities**

### **Owns**

* Business Operation orchestration  
* Execution lifecycle  
* Unit of Work coordination  
* Transaction coordination  
* Application Safeguards  
* Domain Service coordination  
* Repository coordination  
* Domain Event publication  
* Result generation

### **Does Not Own**

* Business rules  
* Database implementation  
* Transport protocols  
* User interface  
* Infrastructure services

---

# **Business Operation**

A **Business Operation** is a complete business action that produces a business outcome.

### **Examples**

* Create Invoice  
* Receive Payment  
* Adjust Inventory  
* Record Expense  
* Create Product  
* Approve Purchase Order

### **Not a Business Operation**

* HTTP request  
* Controller method  
* Repository method  
* SQL query  
* Database transaction

---

# **Execution Lifecycle**

Every Business Operation follows the same execution lifecycle.

Request  
    │  
Authentication  
    │  
Business Context  
    │  
Authorization  
    │  
Application Service  
    │  
Application Safeguards  
    │  
Domain Services  
    │  
Repositories  
    │  
Transaction  
    │  
Domain Events  
    │  
Result

Applies to:

* HTTP Requests  
* AI Operations  
* Background Workers  
* Workflow Engine  
* Scheduled Jobs  
* Webhooks

---

# **Logical Layers**

| Layer | Responsibility |
| ----- | ----- |
| Presentation | Request and Response |
| Application | Business Operation Coordination |
| Domain | Business Rules |
| Persistence | Data Access |
| Infrastructure | Technical Services |

---

# **Layer Boundaries**

### **Presentation**

**Owns**

* Request parsing  
* Authentication  
* Response generation

**Never Owns**

* Business rules  
* Transactions

---

### **Application**

**Owns**

* Business Operations  
* Unit of Work  
* Transaction coordination  
* Application Safeguards

**Never Owns**

* Business rules  
* Persistence logic

---

### **Domain**

**Owns**

* Business rules  
* Policies  
* Calculations  
* Invariants

**Never Owns**

* HTTP  
* Database  
* Infrastructure  
* Framework code

---

### **Persistence**

**Owns**

* Repository implementation  
* Data persistence  
* Query execution

**Never Owns**

* Authorization  
* Business rules  
* Transactions  
* Tenant isolation

Tenant isolation is enforced through the established Execution Context and Row-Level Security architecture.

---

### **Infrastructure**

**Owns**

* Database connectivity  
* Storage  
* Messaging  
* External integrations  
* AI providers

**Never Owns**

* Business behavior  
* Business decisions

---

# **Dependency Rules**

* Presentation → Application  
* Application → Domain  
* Application → Persistence  
* Persistence → Infrastructure

### **Never Allowed**

* Domain → Presentation  
* Domain → Infrastructure  
* Persistence → Application  
* Infrastructure → Domain

Dependencies always flow downward.

---

# **Architectural Principles**

### **APP-001 — Business Operations are the Unit of Execution**

Every request executes as a Business Operation.

---

### **APP-002 — Application Coordinates**

The Application Layer coordinates Business Operations but never owns business rules.

---

### **APP-003 — Uniform Execution**

All execution sources follow the same lifecycle.

---

### **APP-004 — Single Responsibility**

Each layer owns exactly one architectural responsibility.

---

### **APP-005 — Downward Dependencies**

Dependencies flow only toward lower architectural layers.

---

### **APP-006 — Framework Independence**

Application Architecture remains independent of implementation frameworks.

---

# **Chapter 9.2 — Application Services**

## **Objective**

Define the responsibilities, ownership, and boundaries of Application Services.

Application Services coordinate Business Operations while preserving domain ownership, transactional consistency, and architectural separation.

---

# **Core Principles**

* One Business Operation → One Application Service.  
* Application Services coordinate; they do not implement domain rules.  
* Every business state change begins through an Application Service.  
* Domain ownership must always be respected.  
* Business Operations remain explicit and self-contained.

---

# **Responsibilities**

### **Owns**

* Business Operation orchestration  
* Application Safeguards  
* Cross-domain coordination  
* Domain Event publication  
* Execution result

### **Never Owns**

* Domain rules  
* Domain data ownership  
* Persistence implementation  
* Infrastructure implementation  
* Transport logic

---

# **Coordination Rules**

Application Services coordinate a Business Operation across one or more domains while respecting domain ownership.

### **Responsibilities**

* Coordinate participating domains.  
* Invoke domain rules.  
* Persist business changes.  
* Publish Domain Events.  
* Return the business outcome.

Application Services never bypass domain ownership.

---

# **Domain Ownership**

Each domain exclusively owns:

* Domain rules  
* Aggregates  
* Repositories  
* Domain Events  
* Business data

Application Services coordinate domains.

They do not own them.

---

# **Repository Rules**

Application Services access persistence only through repository contracts.

Repositories are responsible only for:

* Reading data  
* Persisting data

Repositories never:

* Implement domain rules  
* Coordinate Business Operations  
* Manage business workflows

Tenant isolation remains the responsibility of the established Execution Context and Row-Level Security architecture.

---

# **Dependency Rules**

### **May Depend On**

* Domain abstractions  
* Repository contracts  
* Event publisher contracts  
* Application contracts

### **Must Never Depend On**

* Database implementations  
* External services  
* Framework-specific components  
* Infrastructure implementations

---

# **Architectural Principles**

### **APP-007 — Single Business Operation Owner**

Each Business Operation is coordinated by exactly one Application Service.

---

### **APP-008 — Coordination Before Implementation**

Application Services coordinate Business Operations but never implement domain rules.

---

### **APP-009 — Respect Domain Ownership**

Application Services coordinate domains without bypassing their ownership boundaries.

---

### **APP-010 — Explicit Business Operations**

Every business state change occurs through an explicit Business Operation.

---

### **APP-011 — Repository Abstraction**

Application Services interact with persistence only through repository contracts.

---

### **APP-012 — No Hidden Orchestration**

Business coordination must remain explicit within the Application Layer.

---

# **Chapter 9.3 — Domain Rules**

## **Objective**

Define the ownership, responsibilities, and boundaries of Domain Rules.

Domain Rules determine whether a Business Operation is valid and preserve business consistency across the platform.

---

# **Core Principles**

* Domain Rules define business behavior.  
* Domain Rules belong to their owning domain.  
* Domain Rules remain infrastructure independent.  
* Domain Rules are deterministic.  
* Every Domain Rule has one authoritative implementation.

---

# **Responsibilities**

### **Domain Rules May**

* Validate business conditions.  
* Apply business policies.  
* Perform business calculations.  
* Enforce Domain Invariants.  
* Produce Domain Events.

### **Domain Rules Must Never**

* Execute SQL.  
* Manage transactions.  
* Perform authentication.  
* Perform authorization.  
* Access repositories directly.  
* Call external services.  
* Depend on infrastructure.

Business behavior remains outside the database, consistent with the Database Automation Policy.

---

# **Domain Invariants**

Domain Invariants must always remain true.

### **Examples**

* Invoice cannot be paid twice.  
* Stock cannot become negative.  
* Journal entries remain balanced.  
* Credit limit cannot be exceeded.  
* Ownership is immutable.  
* Invoice numbers are unique within a business.

Violation of a Domain Invariant invalidates the Business Operation.

---

# **Single Source of Truth**

Every Domain Rule has exactly one implementation.

Domain Rules must never be duplicated across:

* Controllers  
* Application Services  
* Repositories  
* Database triggers  
* Event Consumers  
* AI Tools  
* Workflows

---

# **Dependency Rules**

### **May Depend On**

* Domain entities  
* Value objects  
* Domain policies  
* Domain abstractions

### **Must Never Depend On**

* HTTP  
* ORM  
* PostgreSQL  
* Frameworks  
* External APIs  
* Infrastructure services

---

# **Architectural Principles**

### **APP-013 — Domain Rule Ownership**

Domain Rules belong exclusively to their owning domain.

---

### **APP-014 — Single Rule Implementation**

Every Domain Rule has exactly one authoritative implementation.

---

### **APP-015 — Preserve Domain Invariants**

Domain Invariants must remain valid before and after every Business Operation.

---

### **APP-016 — Infrastructure Independence**

Domain Rules remain independent of persistence, frameworks, and infrastructure.

---

### **APP-017 — Deterministic Execution**

Given the same business state and inputs, Domain Rules always produce the same outcome.

# **Chapter 9.4 — Repository Contracts**

## **Objective**

Define the responsibilities, ownership, and boundaries of repositories.

Repositories abstract persistence while remaining independent of business behavior and security policies.

---

# **Core Principles**

* Repositories abstract persistence.  
* Repositories do not implement domain rules.  
* Repositories are tenant-agnostic.  
* Repositories remain infrastructure-independent.  
* Persistence concerns are isolated from business behavior.

---

# **Responsibilities**

### **Owns**

* Data retrieval  
* Data persistence  
* Query execution  
* Persistence mapping

### **Never Owns**

* Domain Rules  
* Business Operations  
* Transactions  
* Authorization  
* Tenant isolation  
* Event publication

---

# **Repository Rules**

Repositories:

* Read business data.  
* Persist business data.  
* Return domain objects.  
* Hide persistence implementation.

Repositories must never:

* Validate business rules.  
* Coordinate Business Operations.  
* Call external services.  
* Execute business workflows.

---

# **Tenant Isolation**

Repositories remain tenant-agnostic.

Example

findInvoice(id)

Not

findInvoice(id, business\_id)

Tenant isolation is enforced through the established Execution Context and Row-Level Security architecture, not repository logic.

---

# **Repository Ownership**

Each repository belongs to exactly one domain.

Examples

| Domain | Repository |
| ----- | ----- |
| Sales | Invoice Repository |
| Inventory | Inventory Repository |
| Purchasing | Purchase Order Repository |
| Ledger | Journal Repository |
| CRM | Customer Repository |

Repositories must never modify another domain's data.

Cross-domain coordination belongs to the Application Layer.

---

# **Dependency Rules**

### **May Depend On**

* Persistence contracts  
* Database abstractions  
* Mapping components

### **Must Never Depend On**

* Application Services  
* Domain Rules  
* Controllers  
* External APIs  
* Infrastructure consumers

---

# **Architectural Principles**

### **APP-018 — Repository Responsibility**

Repositories are responsible only for persistence.

---

### **APP-019 — Repository Independence**

Repositories remain independent of business behavior.

---

### **APP-020 — Tenant-Agnostic Repositories**

Repositories rely on the Execution Context and Row-Level Security for tenant isolation.

---

### **APP-021 — Domain Ownership**

Repositories belong exclusively to their owning domain.

Repositories must never modify another domain's data.

---

### **APP-022 — Persistence Abstraction**

Business logic remains independent of the underlying persistence technology.

# **Chapter 9.5 — Cross-Cutting Concerns**

## **Objective**

Define platform-wide concerns applied consistently across every Business Operation.

Cross-Cutting Concerns provide consistency, security, observability, and operational reliability without becoming part of domain logic.

---

# **Core Principles**

* Applied to every Business Operation.  
* Independent of domains.  
* Independent of persistence.  
* Independent of transport.  
* Implemented once and reused consistently.

---

# **Validation**

### **Responsibilities**

* Validate request structure.  
* Validate required fields.  
* Validate data types.  
* Validate input format.  
* Reject malformed requests.

### **Never**

* Evaluate Domain Rules.  
* Perform authorization.  
* Execute business logic.

---

# **Error Handling**

### **Responsibilities**

* Return standardized errors.  
* Preserve execution consistency.  
* Prevent internal information leakage.  
* Handle unexpected failures gracefully.

---

# **Logging**

### **Responsibilities**

* Record application execution.  
* Record operational events.  
* Record failures.  
* Support diagnostics.

### **Never**

* Replace auditing.  
* Store business history.

---

# **Auditing**

### **Responsibilities**

* Record business-critical actions.  
* Record security-sensitive actions.  
* Preserve immutable audit history.  
* Support compliance.

---

# **Observability**

### **Responsibilities**

* Collect metrics.  
* Measure performance.  
* Track failures.  
* Monitor system health.

---

# **Correlation**

### **Responsibilities**

* Assign a Correlation ID.  
* Propagate the Correlation ID.  
* Link logs, audits, events, and background execution to the originating Business Operation.

---

# **Architectural Principles**

### **APP-018 — Consistent Validation**

Validation is performed before business execution.

---

### **APP-019 — Standardized Error Handling**

Application errors follow a consistent contract.

---

### **APP-020 — Operational Logging**

Operational events are logged consistently across the platform.

---

### **APP-021 — Immutable Auditing**

Business and security audit records are immutable.

---

### **APP-022 — Observable Execution**

Every Business Operation exposes operational telemetry.

---

### **APP-023 — End-to-End Traceability**

Every Business Operation is traceable through a Correlation ID.

# Chapter 10 — Gateway Architecture

# **10.1 Gateway Philosophy**

### **Purpose**

The Gateway is the only external entry point into Atlas.

It transforms external interactions into trusted Execution Contexts that can be processed by the Application Architecture.

---

### **Responsibilities**

The Gateway is responsible for:

* Identity establishment  
* Business context resolution  
* Execution Context creation  
* Request protection  
* Communication contracts  
* Request routing  
  ---

  ### **Does Not Own**

The Gateway does not own:

* Business rules  
* Authorization decisions  
* Transactions  
* Repository access  
* Database operations  
* Domain events  
* Business workflows

These responsibilities remain owned by the Schema, Database Architecture, and Application Architecture.

---

### **Design Principles**

* All external interactions enter through the Gateway.  
* Every request follows one execution lifecycle.  
* Business logic never resides in the Gateway.  
* The Gateway extends existing architectural contracts without redefining them.  
  ---

  # **10.2 Identity & Execution Context**

  ## **Objective**

Define how external identities become trusted Execution Contexts.

---

### **Identity Establishment**

The Gateway creates a validated Execution Context containing:

* User  
* Session  
* Business  
* Business Member  
* Request Metadata  
  ---

  ### **Business Context Resolution**

After identity verification, the Gateway determines the active business context and validates membership before execution.

---

### **Execution Context**

The Gateway creates a validated Execution Context containing:

* User  
* Session  
* Business  
* Business Member  
* Roles  
* Permissions  
* Request Metadata

The Execution Context is passed unchanged to the Application Architecture.

---

### **Responsibility Boundary**

The Gateway:

* establishes identity  
* establishes business context  
* creates Execution Context

The Application Architecture:

* evaluates authorization  
* executes business logic  
* manages transactions  
  ---

  ### **Design Principles**

* Every request requires a validated identity.  
* Every request executes within a single Execution Context.  
* Execution Context remains immutable during execution.  
* HTTP, AI, workflows, and background workers follow the same execution model.  
  ---

  # **10.3 Request Protection**

  ## **Objective**

Protect the architectural boundary before requests enter Atlas.

---

### **Trust Boundary**

No request enters the Application Architecture until Gateway validation completes.

---

### **Protection Responsibilities**

The Gateway enforces:

* Transport security  
* Request validation  
* Traffic control  
* Abuse prevention  
* Security policies  
* Platform availability policies  
  ---

  ### **Design Principles**

* Security precedes execution.  
* Protection remains independent of business logic.  
* Internal layers operate only on trusted requests.  
  ---

  # **10.4 Request Lifecycle**

  ## **Objective**

Define the invariant processing lifecycle for every external interaction.

---

### **Processing Lifecycle**

External Request

       │

Gateway

       │

Identity Verification

       │

Business Context Resolution

       │

Execution Context Creation

       │

Request Validation

       │

Application Service

After the Execution Context is created, responsibility transfers to the Application Architecture.

---

### **Design Principles**

* Every interaction follows the same lifecycle.  
* Every request receives a correlation identifier.  
* Execution Context is created exactly once.  
* Responsibility transfers only after Gateway validation completes.  
  ---

  # **10.5 Communication Contracts**

  ## **Objective**

Define a consistent contract for all external consumers.

---

### **Communication Standards**

The Gateway standardizes:

* Resource naming  
* Request structure  
* Response structure  
* Error contracts  
* Version evolution  
* Pagination  
* Filtering  
* Sorting  
* Searching  
* Bulk operations  
* Idempotent interactions  
  ---

  ### **Design Principles**

* External contracts remain consistent.  
* Internal implementation does not affect external contracts.  
* Contract evolution preserves compatibility whenever practical.  
  ---

  # **10.6 External Resource Architecture**

  ## **Objective**

Define how Atlas exchanges external resources while preserving architectural boundaries.

---

### **Resource Exchange**

The Gateway provides controlled interaction through:

* Public APIs  
* API Keys  
* Webhooks  
* Third-party integrations  
* Service integrations  
* AI integrations  
* Resource exchange  
  ---

  ### **Resource Protection**

Every external resource follows the same architectural principles:

* Identity verification  
* Ownership validation  
* Access control  
* Resource validation  
* Secure transfer  
  ---

  ### **Boundary Rules**

* Internal runtime communication is outside the Gateway boundary.  
* External resources never bypass the Gateway.  
* Storage and transport implementations remain implementation-independent.  
  ---

  # **Chapter 10 Architectural Laws**

Instead of ending with prose, I would end the chapter exactly like the Database and Application Architecture—with laws.

### **GW-001 — Single Entry Point**

All external interactions enter Atlas exclusively through the Gateway.

### **GW-002 — Identity Before Execution**

Every request must establish a verified identity before execution.

### **GW-003 — Business Context Before Execution**

Every request must resolve a valid business context before creating an Execution Context.

### **GW-004 — Single Execution Context**

Each request creates exactly one immutable Execution Context.

### **GW-005 — Gateway Before Application**

Application Services execute only after Gateway validation completes.

### **GW-006 — Business Logic Separation**

Business logic shall never reside within the Gateway.

### **GW-007 — Unified Execution Model**

HTTP requests, AI interactions, integrations, workflows, and background execution follow the same Execution Context model.

### **GW-008 — Consistent Communication Contracts**

All external interfaces shall expose consistent communication contracts.

### **GW-009 — Protected Boundary**

Only trusted and validated requests may cross the Gateway boundary.

### **GW-010 — Implementation Independence**

Gateway responsibilities define architectural behavior rather than implementation technologies.

* 

