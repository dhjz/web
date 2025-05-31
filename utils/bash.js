window.bashJs = /* shell */`
#-------------------------- .bashrc文件 --------------------------
# # .bashrc文件
tf(){
  if [ "$1" = "task" ]; then
    tail -f -n200 "/data/logs/xxx-task/nohup.out"
  elif [ "$1" = "bac" ]; then
    tail -f -n200 "/data/logs/xxx-backend/nohup.out"
  else
    tail -f -n200 "$1"
  fi
}
wg() {
  wget "http://10.10.10.10:8080/release/$1";
}
ln -s /data/project/xxx-backend /home/user01/backend
alias aaa='cd /data/project/xxx'
nohup /opt/chfs/start.sh  > /opt/logs/chfs.log 2>&1 &
nohup ~/frp/frpc -c ~/frp/frpc.ini > ~/logs/frpc.log 2>&1 &



#-------------------------- node相关配置 --------------------------
# # node相关配置
# https://github.com/coreybutler/nvm-windows/releases
nvm seeting.ini  nvm目录执行
nvm node_mirror https://npmmirror.com/mirrors/node/
nvm npm_mirror https://npmmirror.com/mirrors/npm/
nvm install 16.14.2
# 环境变量:  NVM_SYMLINK E:\\Program\\nodejs   NVM_HOME: E:\\Program\\nvm     PATH: %NVM_SYMLINK%   %NVM_HOME%
npm config set registry https://registry.npmmirror.com
npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass/
npm config list
npm config set prefix "E:\\Program\\nodejs\\node_global"
npm config set cache "E:\\Program\\nodejs\\node_cache"
npm install -g http-server
npm install -g files-upload-server
npm install -g rimraf
yarn config set registry https://registry.npmmirror.com -g
yarn config set global-folder "E:\\Program\\nodejs\\yarn_global"
yarn config set cache-folder "E:\\Program\\nodejs\\yarn_cache"

#-------------------------- go相关配置 --------------------------
# # go相关配置
# 官方下载包, zip解压, 配置环境变量
# 配置 PATH, 为go/bin
# 配置 GOROOT, 为go安装路径
# 配置 GOPATH, 在go下面建一个gopath, 配置成这个路径, 一般包含三个子目录 src、pkg 和 bin。其中，src 存放源代码，pkg 存放编译生成的库文件，bin 存放编译生成的可执行文件
go env -w GOPROXY=https://goproxy.cn,direct
# 打包文件
rmdir /S /Q .\\app
xcopy /E /Y "..\\web\dist\\*" ".\\app\\ "
go env -w GOOS=linux
go build -ldflags "-s -w" -o ./dist/
go env -w GOOS=linux GOARCH=arm  GOARM=7 
go build -ldflags "-s -w" -o ./dist/dhttpc_v7
go env -w GOOS=windows GOARCH=amd64 GOARM=
go build -ldflags "-s -w -H=windowsgui" -o ./dist/
echo "build linux and windows exe success..."

#-------------------------- gradle相关配置 --------------------------
# # gradle相关配置
# https://gradle.org/releases/    binary-only 
# 配置 GRADLE_HOME  安装目录  E:\\Program\\Android\\gradle-6.9.3
# 配置 GRADLE_USER_HOME  仓库目录 E:\\Program\\Android\\gradlehome
# 配置 PATH  %GRADLE_HOME%\\bin

#-------------------------- maven相关配置 --------------------------
# # maven相关配置
#1. http://maven.apache.org/download.cgi, 下载maven
#2. 解压到某个盘,比如E:\\Program\\Apache\\maven
#3. 配置 'MAVEN_HOME'，E:\\Program\\Apache\\maven
#4. 配置 'PATH'，%MAVEN_HOME%\\bin\\;
#5. 打开cmd, 输入'mvn -v' 可查看安装好了没
#配置mavenrepo仓库
#1. 在E:\\Program\\Apache\\目录下新建mavenrepo文件夹，该目录用作maven的本地库。
#2. 打开E:\\Program\\Apache\\maven\\conf\\settings.xml文件，查找下面这行代码：并修改成刚创建的目录
# <localRepository>/path/to/local/repo</localRepository>


#-------------------------- 常见脚本命令 --------------------------
# # 常见脚本命令
zip -r web.zip ./web
unzip web.zip -d ./web
# 打包
tar -cvf web.tar ./web
tar -zcvf web.tar.gz web
# 解压
tar -xvf 文件名.tar
tar -zxvf 文件名.tar.gz
tar -jxvf 文件名.tar.bz2
# mysql
mysql -h127.0.0.1 -P3306 -uroot -p'root123'
# redis
./redis-cli -h 127.0.0.1 -p 6379
AUTH <password>
# sftp
sftp -P 80 username@hostname
get filename.txt /path/to/local/directory
put file.txt
ls *.txt
# windows 复制文件且覆盖
xcopy /e/h/i/y dist D:\\JAVA\\base-org\\webapp
# docker
systemctl stop docker.socket & systemctl stop docker  
# {"registry-mirrors": ["https://dockerpull.org"]}
vi /etc/docker/daemon.json  
systemctl daemon-reload  
systemctl restart docker
docker exec -it 0ec189a76922 /bin/sh
docker update --restart=no my_container
# putty连接服务器
putty.exe root@192.168.1.2 -pw root123
# 多开微信
start /B cmd /C "E:\\Program Files (x86)\\Tencent\\WeChat\\WeChat.exe"
start /B cmd /C "E:\\Program Files (x86)\\Tencent\\WeChat\\WeChat.exe"
# 跨域Chrome
"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --disable-web-security --user-data-dir=E:\\AllCache\\Chrome --allow-running-insecure-content %1
# curl
curl --request POST --url 'http://127.0.0.1:666' --data '{"name": "test"}' --header "Authorization: pass" --header "Content-Type: application/json"
# putty连接服务器
putty.exe root@127.0.0.1 -P 23 -pw a12456


#-------------------------- sql_exprt_xxx.sh --------------------------
# # sql导出数据CSV
#!/bin/bash

MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASSWORD="root123"
MYSQL_DATABASE="test_db"
CURRENT_TIME=$(date +"%Y%m%d%H%M%S")
OUTPUT_FILE="./export_xxx_\${CURRENT_TIME}.sql"
# 1.直接sql语句
SQL="SELECT CONCAT('(', CONCAT_WS(', ', 
CONCAT('\'', stcd, '\''),
CONCAT('\'', tm, '\''),
z,
q,
CONCAT('\'', IFNULL(wptn, 'NULL'), '\''),
CONCAT('\'', js_dt, '\'')
), '),')
 from test where tm > '2023-07-20 00:00:00' order by stcd ASC, tm desc;"

echo "$SQL" |
  /data/mysql/mysql-5.7.40/bin/mysql  -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE |
  sed 's/\t/","/g;s/^/"/;s/$/"/;' > $OUTPUT_FILE
  
# 2.sql文件
SQL_FILE="./sql.sql"

mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < $SQL_FILE |
  sed 's/\t/","/g;s/^/"/;s/$/"/;' > $OUTPUT_FILE

# 3.直接导出整个sql数据库
# 导出表和数据
/data/mysql/mysql-5.7.40/bin/mysqldump -h192.168.1.180 -P3306 -uxxx -pxxx -S /data/mysql/data/mysql.sock --databases xxx_prod > /data/sql_bak/xxx_prod.sql
# 导出数据忽略表
/data/mysql/mysql-5.7.40/bin/mysqldump -h192.168.1.180 -P3306 -uxxx -pxxx --no-tablespaces --ignore-table=xxx_prod.xxx_table1 --ignore-table=xxx_prod.xxx_table2  xxx_prod > backup.sql
# 导出数据指定表
/data/mysql/mysql-5.7.40/bin/mysqldump -uXXX -pXXXXX -S /data/mysql/data/mysql.sock prod_base table1 table2 table3 > /data/sql_bak/prod_20240501_2.sql

#-------------------------- start-server.sh --------------------------
# # jar启动脚本
#!/bin/bash
jvm="-Xms512M -Xmx512M -Xmn256M -Xss256K -XX:MetaspaceSize=256M -XX:MaxMetaspaceSize=256M -XX:SurvivorRatio=8 -XX:MaxTenuringThreshold=5 -XX:PretenureSizeThreshold=1M -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintGCDateStamps -Xloggc:./gc.log"

APP_NAME="java-test-service"
PORT=8181
JAR_NAME=$2

start(){
  if [ "$JAR_NAME" = "" ]; then
    echo "please input the jar name"
    exit 1
  fi
  existing_pid=$(ps -aux | grep java| grep \${APP_NAME}|grep -v grep|awk '{print $2}')
  if [ -n "$existing_pid" ]; then
    echo "\${APP_NAME} is running...\${current_pid} \${existing_pid}"
  else
    # 启动新的进程
    echo "Starting \${APP_NAME} process...\${JAR_NAME}"
    nohup java \${jvm} -jar  $JAR_NAME --spring.profiles.active=prod --server.port=$PORT >> nohup.out  2>&1 &
    echo "\${APP_NAME} process started on \${PORT}."
  fi
}
stop(){
  # 检查是否存在正在运行的进程
  current_pid=$$
  existing_pid=$(ps -aux | grep java| grep \${APP_NAME}|grep -v grep |awk '{print $2}')
  if [ -n "$existing_pid" ]; then
    echo "Stopping existing \${APP_NAME} process with PID: $existing_pid"
    kill -9 $existing_pid
    # sleep 5  # 等待进程终止
    echo "\${APP_NAME} process stopped."
  else
    echo "No existing \${APP_NAME} process found."
  fi
}
writejar(){
    echo "$1" > currname.txt
}
readjar() {
    cat currname.txt
}

if [ "$2" = "" ]; then
	JAR_NAME=$(readjar)
	echo "read jar name from currname.txt: \${JAR_NAME}"
else
	writejar "$2"
fi

if [ "$1" = "start" ]; then
  start
elif [ "$1" = "stop" ]; then
  stop
elif [ "$1" = "restart" ]; then
  stop
  start
elif [ "$1" = "r" ]; then
  stop
  start
else
  echo "Invalid argument. Usage: $0 <start|stop|restart|r>"
  exit 1
fi

exit 0
`