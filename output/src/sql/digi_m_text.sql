-- sample SQL statements for the digi_m_text
CREATE TABLE digi_m_text (
  id  int not null PRIMARY KEY,
  created  int,
  updated ,
  creator ,
  updater ,
  orderid  int,
  parentid  int,
  nodeid  int,
  mytxt  text ,
  heading  varchar(255),
)
