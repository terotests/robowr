-- sample SQL statements for the change_activity
CREATE TABLE change_activity (
  id  int not null PRIMARY KEY,
  started  int,
  completed  int,
  created  int,
  name  varchar(255),
  errors  int,
  error_txt  text ,
)
