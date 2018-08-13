-- sample SQL statements for the tbl_app_log
CREATE TABLE tbl_app_log (
  id  int not null PRIMARY KEY,
  logtype  varchar(255),
  logmessage  text ,
  logtime  int,
)
