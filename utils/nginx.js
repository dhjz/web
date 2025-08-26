window.nginxJs = /* sh */`
#-------------------------- 前端配置 --------------------------
# root: url的ip/域名+port 替换为root指定的目录(会携带匹配到的路径到本地目录后面)
# alias: url的ip/域名+port+匹配到的路径 替换为alias指定的目录
# @ alias前端
# 注意末尾dist必须有/, 不然 /camp/ 替换为 /data/camp/dist -> /data/camp/distindex.html
# 访问 /camp/  ->  /data/camp/dist/index.html
# 访问 /camp/static/index.js  ->  /data/camp/dist/static/index.js
location /camp/ {
    alias  /data/camp/dist/;
    index  index.html index.htm;
    try_files $uri $uri/ /camp/index.html =404;
}

# @ root前端
# 访问 /camp/  ->  /data/camp/dist/camp/index.html
# 访问 /camp/static/index.js  ->  /data/camp/dist/camp/static/index.js
location /camp/ {
    root  /data/camp/dist;
    index  index.html index.htm;
    try_files $uri $uri/ /camp/index.html =404;
}
# 正确常用配置 /camp/  ->  /data/camp/web/camp/index.html, web里面新建一个camp目录放静态资源
location /camp/ {
    root  /data/camp/web;
    index  index.html index.htm;
    try_files $uri $uri/ /camp/index.html =404;
}

#-------------------------- 后端配置 --------------------------
# @ 跨域请求
location / {
    root   /opt/web;
    index  index.html index.htm;
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    # 允许浏览器缓存跨域请求的预检响应（OPTIONS 请求）
    add_header 'Access-Control-Max-Age' 1728000;
    # 如果是预检请求（OPTIONS），直接返回 200
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        return 200;
    }
}
# @ 后端代理
location /camp/prod-api/ {
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://127.0.0.1:28070/;
    proxy_redirect off;
}

# @ ssl代理 + 权限校验
# 如果需要添加其他用户，执行不带 -c 选项的命令
# apt install apache2-utils
# htpasswd -c /opt/.htpasswd-admin admin
server {
    listen 43000 ssl;
    server_name localhost;
    client_max_body_size 300m;     #设置nginx能处理的最大请求主体大小。
    client_body_buffer_size 128k;  #请求主体的缓冲区大小。 

    ssl_certificate /opt/ssl/home.199311.xyz_bundle.crt;
    ssl_certificate_key /opt/ssl/home.199311.xyz.key;
    #ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3; 
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
    ssl_prefer_server_ciphers on;

    location / {
        # --- 权限校验配置 ---
        auth_basic "Restricted Access - Please Enter Credentials"; # 弹窗提示信息
        auth_basic_user_file /opt/.htpasswd-admin;
        # --- 反向代理配置 ---
        proxy_pass http://127.0.0.1:3000;
        # --- WebSocket 支持（VS Code Server 严重依赖 WebSocket 进行实时通信）---
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# @ http+https转到同一个服务
# 1. 外层服务 http[s]://xxx:40003 -> 127.0.0.1:3000
stream {
    map $ssl_preread_protocol $backend_name {
        default http_backend;
        "TLSv1.2" https_backend;
        "TLSv1.3" https_backend;
    }
    upstream http_backend {
        server 127.0.0.1:14002;
    }
    upstream https_backend {
        server 127.0.0.1:14003;
    }
    server {
        listen 40003;
        proxy_pass $backend_name;
        ssl_preread on;
    }
}
# 2. http内层
server {
    listen 14002;
    server_name localhost;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
    }
}
server {
    listen 14003 ssl;
    server_name localhost;
    ssl_certificate /opt/ssl/home.199311.xyz_bundle.crt;
    ssl_certificate_key /opt/ssl/home.199311.xyz.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3; 
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
    ssl_prefer_server_ciphers on;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# @ 负载均衡
stream {
    upstream my_service {
        # -------------------- 模式一：权重模式, 越高分配的越多 3倍 2倍 --------------------
        server 127.0.0.1:3000 weight=1;
        server 127.0.0.1:3001 weight=2;
        server 127.0.0.1:3002 weight=3;
        # -------------------- 模式二：主备模式 --------------------
        # server 127.0.0.1:3000; # 主服务器
        # server 127.0.0.1:3001 backup; # 备用服务器
        # server 127.0.0.1:3002 backup; # 另一个备用服务器
    }
}
http {
    server {
        listen 8080;
        location / {
            proxy_pass my_service;
            # ...其他配置
        }
    }
}
`