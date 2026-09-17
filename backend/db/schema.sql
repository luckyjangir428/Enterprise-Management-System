CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ADMIN', 'USER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products
(product_code, product_name, category, unit, base_price)
VALUES
('IP-001', 'Industrial Product A', 'Mechanical', 'Piece', 1500.00),
('IP-002', 'Industrial Product B', 'Mechanical', 'Piece', 2200.00),
('IP-003', 'Industrial Product C', 'Electrical', 'Piece', 1800.00),
('IP-004', 'Industrial Product D', 'Electrical', 'Piece', 3200.00),
('IP-005', 'Industrial Product E', 'Hydraulic', 'Piece', 4500.00),
('IP-006', 'Industrial Product F', 'Safety', 'Piece', 850.00);


CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL,
    physical_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT check_physical_quantity
        CHECK (physical_quantity >= 0),

    CONSTRAINT check_reserved_quantity
        CHECK (reserved_quantity >= 0),

    CONSTRAINT check_reserved_not_more_than_physical
        CHECK (reserved_quantity <= physical_quantity)
);

INSERT INTO inventory
(product_id, physical_quantity, reserved_quantity)
VALUES
(1, 200, 0),
(2, 150, 0),
(3, 300, 0),
(4, 100, 0),
(5, 80, 0),
(6, 250, 0);

CREATE TABLE enquiries (
    id SERIAL PRIMARY KEY,
    enquiry_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',

    CONSTRAINT fk_enquiry_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT check_enquiry_status
        CHECK (status IN ('NEW', 'QUOTED', 'WON', 'LOST')),

    CONSTRAINT check_required_date
        CHECK (required_date >= enquiry_date)
);

CREATE TABLE enquiry_items (
    id SERIAL PRIMARY KEY,
    enquiry_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,

    CONSTRAINT fk_enquiry_item_enquiry
        FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enquiry_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT check_enquiry_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT unique_enquiry_product
        UNIQUE (enquiry_id, product_id)
);

CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    enquiry_id INTEGER UNIQUE NOT NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT fk_quotation_enquiry
        FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(id),

    CONSTRAINT check_quotation_status
        CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED')),

    CONSTRAINT check_quotation_validity
        CHECK (valid_until >= quotation_date)
);

CREATE TABLE quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_quotation_item_quotation
        FOREIGN KEY (quotation_id)
        REFERENCES quotations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quotation_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT check_quotation_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT check_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT check_discount
        CHECK (discount_percent >= 0 AND discount_percent <= 100),

    CONSTRAINT check_gst
        CHECK (gst_percent >= 0),

    CONSTRAINT unique_quotation_product
        UNIQUE (quotation_id, product_id)
);

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id INTEGER UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_sales_order_quotation
        FOREIGN KEY (quotation_id)
        REFERENCES quotations(id),

    CONSTRAINT fk_sales_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT check_sales_order_total
        CHECK (total_amount >= 0),

    CONSTRAINT check_sales_order_status
        CHECK (
            status IN (
                'PENDING',
                'CONFIRMED',
                'DISPATCHED',
                'CANCELLED'
            )
        )
);

CREATE TABLE sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,

    CONSTRAINT fk_sales_order_item_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_order_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT check_sales_order_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT check_sales_order_item_price
        CHECK (unit_price >= 0),

    CONSTRAINT unique_sales_order_product
        UNIQUE (sales_order_id, product_id)
);

CREATE TABLE dispatches (
    id SERIAL PRIMARY KEY,
    dispatch_number VARCHAR(50) UNIQUE NOT NULL,
    sales_order_id INTEGER UNIQUE NOT NULL,
    dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vehicle_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,

    CONSTRAINT fk_dispatch_sales_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(id)
);