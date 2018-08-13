-- sample SQL statements for the TblTblTblTblTblTblgraph_journal
CREATE TABLE TblTblTblTblTblTblgraph_journal (
  id  int not null PRIMARY KEY,
  src_node  int,
  link_id  int,
  target_id  int,
  change_type  int,
  timestamp ,
  user_id  int,
)
