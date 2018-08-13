-- sample SQL statements for the tbl_graph_journal
CREATE TABLE tbl_graph_journal (
  id  int not null PRIMARY KEY,
  src_node  int,
  link_id  int,
  target_id  int,
  change_type  int,
  timestamp ,
  user_id  int,
)
