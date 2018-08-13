-- sample SQL statements for the tbl_app_table_field
CREATE TABLE tbl_app_table_field (
  id  int not null PRIMARY KEY,
  tableid  int,
  fieldname  varchar(255),
  fieldtype  varchar(255),
  is_password  int,
)
