# consultingBot

Prerequisite
* Node
* MySQL
* Python 3.6


Install and run mysql
```
sudo apt install mysql-server
sudo mysql_secure_installation
```
To set up sample environment, add following to the .bashrc
```
export RDS_USERNAME=root
export RDS_PASSWORD=password
export RDS_HOSTNAME=localhost
```

Start MySQL
```
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```

Now, run start the server

```
git clone https://github.com/vCoach-Academy/consultingBot.git
cd consultingBot
npm install
cd NLP
pip install -r requirements.txt
cd ..
npm start
```
