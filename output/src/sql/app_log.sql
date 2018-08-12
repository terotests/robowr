# SQL statements for the app_log
CREATE TABLE app_log (
  id  int not null PRIMARY KEY,
  logtype  varchar(255),
  logmessage  text ,
  logtime  int,
)
