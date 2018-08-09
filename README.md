# robowr

Application Robot

TODO:
- reading the configuration .json files
- perhaps with some format for the name for configuration files ? 
- currently only one config file is read, but possibly you could read several files from directory

Nice to have features
- combine multiple operations for single file system
- multiple datas

# the input could be just reading the JSON from the STDIN ? 

Optionally read from STDIN ? 

```
cat `mydata.json` | robowr --stdin
```


# How to get the commands

The commands are JavaScript npm files

```
/some/directory/doremifa.js
/some/directory/npmmodule.js
```

Input data are `.json` files, which could be merged from several directories

```
/some/directory/doremifa.js
/some/directory/npmmodule.js
```

# Should you create some robo.json files ? 

A configuratio file which does have all the directories etc which are used
for creating of the application.

# Nice libs

- https://github.com/gretzky/golf/blob/master/golf


