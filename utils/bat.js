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
`