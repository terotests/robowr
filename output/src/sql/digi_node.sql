-- SQL statements for the digi_node
CREATE TABLE digi_node (
  id  int not null PRIMARY KEY,
  created  int,
  updated ,
  creator  int,
  updater  int,
  orderid  int,
  parentid  int,
  classname  varchar(255),
  objid  int,
  name  varchar(255),
  draftspace  int,
  archived  int,
)
