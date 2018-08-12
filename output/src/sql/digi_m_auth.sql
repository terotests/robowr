# SQL statements for the digi_m_auth
CREATE TABLE digi_m_auth (
  id  int not null PRIMARY KEY,
  created  int,
  updated ,
  creator  int,
  updater  int,
  orderid  int,
  parentid  int,
  nodeid  int,
  rolename  varchar(255),
  username  varchar(255),
  password  varchar(255),
)
