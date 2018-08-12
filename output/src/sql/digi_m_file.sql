# SQL statements for the digi_m_file
CREATE TABLE digi_m_file (
  id  int not null PRIMARY KEY,
  created  int,
  updated ,
  creator  int,
  updater  int,
  orderid  int,
  parentid  int,
  nodeid  int,
  path  varchar(255),
  filename  varchar(255),
  orignal_name  varchar(255),
  filetype  varchar(255),
  name  varchar(255),
  tnpath  varchar(255),
  encrypted  int,
)
