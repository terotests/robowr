-- sample SQL statements for the app_setting
CREATE TABLE app_setting (
  id  int not null PRIMARY KEY,
  key  varchar(255),
  str_value  text ,
  int_value  int,
)
