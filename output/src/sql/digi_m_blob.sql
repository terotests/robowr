-- sample SQL statements for the digi_m_blob
CREATE TABLE digi_m_blob (
  id  int not null PRIMARY KEY,
  created  int,
  updated ,
  creator  int,
  updater  int,
  orderid  int,
  parentid  int,
  nodeid  int,
  heading  varchar(255),
  mytxt  text ,
)
