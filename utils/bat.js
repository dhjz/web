window.batJs = /* shell */`
::-------------------------- run_server.bat --------------------------
:: # 选择脚本
@echo off
REM chcp 65001
setlocal enabledelayedexpansion
:: 获取拖入的第一个文件的全路径
set "fullPath=%~1"
:: 获取文件名（不包含路径）
set "fileName=%~nx1"
echo your drag file: %fileName%  %fullPath%

:menu
echo please choose (1-6):
echo 1. backend (default)
set /p choice="please enter your choose: "

if "%choice%"=="" (
)
if "%choice%"=="1" (
  set port=8081
)
echo your choose: %userchoosestr%

set "jar_file="
set "jar_file_name="
if not "%fileName%"=="" (
		echo "***your drag file not null, upload this"
		set "jar_file=%fullPath%"
		set "jar_file_name=%fileName%"
) else (
		
)
echo  "*****choosed*** %port% : %jar_file%, %jar_file_name%"

timeout /t 2
pause
endlocal

::-------------------------- run_web.bat --------------------------
:: # 打包前端代码
@echo off
setlocal enabledelayedexpansion

echo please choose (1-6):
echo 1. dev-test (default)
echo 2. build-prod
set /p choice="please enter your choose: "

echo start time %date:~0,10% %time:~0,2%:%time:~3,5%  your choose: %choice%
cd D:\\JAVA\\xxx-web

if "%choice%"=="" ( npm run dev )
if "%choice%"=="1" ( npm run dev )
if "%choice%"=="2" (
  call npm run build:prod
  timeout /t 2
  call zip -r .\dist-xxx-prod-%date:~0,4%%date:~5,2%%date:~8,2%.zip .\dist
  move .\dist-xxx-prod-%date:~0,4%%date:~5,2%%date:~8,2%.zip .\dist
)

pause
endlocal

::-------------------------- run_frpc.bat --------------------------
:: # 后台执行frpc
@echo off 
if "%1" == "h" goto begin 
mshta vbscript:createobject("wscript.shell").run("%~nx0 h",0)(window.close)&&exit 
:begin 
::
d:
cd frp
start /b frpc -c frpc.ini

:: # 关闭frpc
taskkill /im frpc.exe /t /f

::-------------------------- go_build.bat --------------------------
:: # go_build构建脚本
@echo off
setlocal enabledelayedexpansion

:menu
echo please choose:
echo 1. build service (default)
echo 2. build web
echo 3. build web + service
echo 4. make windows exe icon, ico.syso
set /p choice="please enter your choose: "

if "%choice%"=="" goto buildService
if "%choice%"=="1" (
  goto buildService
)
if "%choice%"=="2" (
  goto buildWeb
)
if "%choice%"=="3" (
  goto buildServiceWeb
)
if "%choice%"=="4" (
  :: 安装 rsrc:  go install github.com/akavel/rsrc@latest
  :: 只在windows上生成图标 ico_windows_amd64.syso 或者ico_windows.syso 
  cd service
  rsrc -ico="ico.ico" -o="ico_windows.syso"
  pause
  exit
)

:buildWeb
cd web
call npm run build
cd ../
exit

:buildService
cd service
rmdir /S /Q .\\app
xcopy /E /Y "..\\web\dist\\*" ".\app\\ "
go env -w GOOS=linux
go build -ldflags "-s -w" -o ./dist/
go env -w GOOS=linux GOARCH=arm  GOARM=7 
go build -ldflags "-s -w" -o ./dist/dhttpc_v7
go env -w GOOS=windows GOARCH=amd64 GOARM=
go build -ldflags "-s -w -H=windowsgui" -o ./dist/
echo "build linux and windows exe success..."
pause
exit

:buildServiceWeb
cd web
call npm run build
cd ../
goto buildService

timeout /t 1
pause
endlocal

::-------------------------- java环境变量配置 --------------------------
:: # java环境变量配置
@echo off
:: 检查是否以管理员身份运行，如果不是，重新以管理员身份运行
openfiles >nul 2>&1 || (powershell -Command "Start-Process cmd -ArgumentList '/c, %~s0' -Verb runAs" && exit)

setx JAVA_HOME "E:\\Program\\Java\\jdk-14.0.1" /M
setx CLASSPATH ".;%JAVA_HOME%\\lib\\dt.jar;%JAVA_HOME%\\lib\\tools.jar;" /M
setx PATH "%PATH%;%JAVA_HOME%\\bin;%JAVA_HOME%\\jre\\bin;" /M
echo environment variables have been set...
pause

:: linux  /etc/profile 最后加上 source /ect/profile 生效
JAVA_HOME=/usr/java/jdk1.8.0_301
CLASSPATH=.:$JAVA_HOME/lib/tools.jar
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME CLASSPATH PATH




`


