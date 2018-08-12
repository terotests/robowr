-- SQL statements for the node_sem
CREATE TABLE node_sem (
  id  int not null PRIMARY KEY,
  userid  int,
  objid  int,
  typeid  int,
  starts ,
  ends ,
  value ,
  creator  int,
  creator_class  int,
  create_time ,
  order_nro  int,
  p00  int,
  p01  int,
  p02  int,
  p03  int,
  p10  int,
  p11  int,
  p12  int,
  p13  int,
  p20  int,
  p21  int,
  p22  int,
  p23  int,
  p30  int,
  p31  int,
  p32  int,
  p33  int,
  local  int,
  local_rem  int,
)
