DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS permissions;

CREATE TABLE inventory(
    id TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    have TEXT NOT NULL,
    need TEXT NOT NULL,
    checkweekly BOOLEAN NOT NULL,
    amountneededweekly TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE users(
    username TEXT UNIQUE NOT NULL,
    password TEXT UNIQUE NOT NULL
);

CREATE TABLE sessions(
    sessionid TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL
);

CREATE TABLE permissions(
    username TEXT UNIQUE NOT NULL,
    read BOOLEAN NOT NULL,
    write BOOLEAN NOT NULL
);

-- -- Initial testing data for inventory items
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('bowls','Bowls','100','15',1,'0.00','none','none');
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('cannedblackbeans','Canned Black Beans','13 cans','8 cans',0,'0.00','none','none');
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('cups','Cups','7','155',1,'0.00','none','none');
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('navybeans','Navy Beans','7lbs','1lbs',0,'0.00','none','none');
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('rice','Rice','8g','None',1,'0.00','none','none');
-- INSERT INTO inventory(id, name, have, need, checkweekly, amountneededweekly, type, location) VALUES ('spoons','Spoons','1077','0',1,'0.00','none','none');