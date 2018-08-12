-- SQL statements for the action_dictionary
CREATE TABLE action_dictionary (
  id  int not null PRIMARY KEY,
  name  text ,
  completed  int,
  complete_pros  int,
  errors  int,
  error_txt  text ,
  action_data  text ,
  created  int,
  response_txt  text ,
  response_handled  int,
  response_handler  varchar(255),
)
