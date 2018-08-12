# SQL statements for the digi_user_profile
CREATE TABLE digi_user_profile (
  id  int not null PRIMARY KEY,
  nodeid  int,
  email  varchar(255),
  allow_email  int,
  vain_tiedotus  int,
  b_seuraan_kirj  int,
  b_seuraan_reissareita  int,
  tele  varchar(255),
  email_t  int,
  email_p  int,
)
