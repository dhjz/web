window.bashJs = `
#-------------------------- run_server.bat --------------------------
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

`