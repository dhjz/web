window.goData = /* go */`
// @ embed静态资源
//go:embed all:webapp
var f embed.FS

func main() {
	port := flag.Int("p", 40002, "server port")
	base.RunPort = *port
	flag.Parse()
	addr := fmt.Sprintf(":%d", *port)
	// 注册静态资源
	st, _ := fs.Sub(f, "webapp")
	http.Handle("/app", http.StripPrefix("/app", http.FileServer(http.FS(st))))
	// 注册接口
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if s, _ := utils.GetParam(r, "url", "u"); s == "" {
			http.FileServer(http.FS(st)).ServeHTTP(w, r)
		} else {
			api.ProxyAi(w, r)
		}
	})
	fmt.Println("********app run on http://localhost" + addr + "/ 启动参数-p 指定端口 ********")
	log.Fatal(http.ListenAndServe(addr, nil))
}

// @ 格式化字节
func FormatBytes(bytes uint64) string {
  const unit = 1024
  if bytes < unit {
    return strconv.FormatUint(bytes, 10) + " B"
  }
  exp := int(math.Log(float64(bytes)) / math.Log(float64(unit)))
  div := uint64(math.Pow(unit, float64(exp)))
  return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// @ GetParam获取参数
// 传入多个可能的参数, 返回一个string
func GetParam(r *http.Request, params ...string) string {
	for _, param := range params {
		if value := r.URL.Query().Get(param); value != "" {
			return value
		}
	}
	return ""
}
func GetParamInt(r *http.Request, param string, defaultVal int) int {
	intValue, err := strconv.Atoi(r.URL.Query().Get(param))
	if err == nil {
		return intValue
	}
	return defaultVal
}
func GetParamFloat(r *http.Request, param string, defaultVal float64) float64 {
	val, err := strconv.ParseFloat(r.URL.Query().Get(param), 64)
	if err == nil {
		return val
	}
	return defaultVal
}

// @ 是否包含并添加删除
func AddIfNotIn[T comparable](s []T, target T) []T {
	found := false
	for _, v := range s {
		if v == target {
			found = true
			break
		}
	}
	if !found {
		s = append(s, target)
	}
	return s
}

func DelIfIn[T comparable](s []T, target T) []T {
	for i, v := range s {
		if v == target {
			s = append(s[:i], s[i+1:]...)
			break
		}
	}
	return s
}

// @ windows不弹出黑色命令行窗口
//go:build windows    //go:build linux  分两个文件写才行, 不然linux没法识别syscall
if runtime.GOOS == "windows" {
  cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
}

// @ 处理一个请求, 根据路径多个方法处理
func HandleApi(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")             //允许访问所有域
	w.Header().Add("Access-Control-Allow-Headers", "*") //header的类型
	w.Header().Set("Content-Type", "application/json")

	// 获取请求路径   strings.HasSuffix
	path := r.URL.Path
	fmt.Println("HandleApi path:", path)

	switch {
	case strings.Contains(path, "/getInfo"):
		getInfo(w, r)
	case strings.Contains(path, "/list"):
		list(w, r)
	default:
		http.NotFound(w, r)
	}
	// result := make(map[string]interface{})
	// result["cpu"] = cpuInfo
}

// @ 请求头跨域
func Cors(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Cache-Control", "max-age=21600") // 设置缓存6小时
		return
	}
}

// @ 返回结果封装
type ResponseData struct {
	Code int         \`json:"code"\`           //相应状态码
	Msg  string      \`json:"msg"\`            //提示信息
	Data interface{} \`json:"data,omitempty"\` //数据
}

func Ok(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
  json.NewEncoder(w).Encode(ResponseData{Code: http.StatusOK, Msg: "操作成功", Data: data})
	// jsonData, _ := json.Marshal(ResponseData{Code: http.StatusOK, Msg: "操作成功", Data: data})
	// w.Write(jsonData)
}

func OkMsg(w http.ResponseWriter, data interface{}, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
  json.NewEncoder(w).Encode(ResponseData{Code: http.StatusOK, Msg: msg, Data: data})
	// jsonData, _ := json.Marshal(ResponseData{Code: http.StatusOK, Msg: msg, Data: data})
	// w.Write(jsonData)
}

func Fail(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
  json.NewEncoder(w).Encode(ResponseData{Code: http.StatusInternalServerError, Msg: "请求失败, 服务端错误"})
	// jsonData, _ := json.Marshal(ResponseData{Code: http.StatusInternalServerError, Msg: "请求失败, 服务端错误"})
	// w.Write(jsonData)
}

func FailMsg(w http.ResponseWriter, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
  json.NewEncoder(w).Encode(ResponseData{Code: http.StatusInternalServerError, Msg: msg})
	// jsonData, _ := json.Marshal(ResponseData{Code: http.StatusInternalServerError, Msg: msg})
	// w.Write(jsonData)
}

// @ 读取JSON配置文件
type Config struct {
	Server struct {
		Port int \`json:"port"\`
	} \`json:"server"\`

	Providers []Provider \`json:"providers"\`

	Prompts []struct {
		ID     string \`json:"id"\`
		Name   string \`json:"name"\`
	} \`json:"prompts"\`
}
var AppConfig Config

func InitAppConfig() {
  // linux 和 window 兼容应用程序同目录配置文件
	dir, _ := os.Getwd()
	configPath := filepath.Join(dir, "config.json")
	configFile, err := os.Open(configPath)
	if err != nil {
		dirOs, _ := filepath.Abs(filepath.Dir(os.Args[0]))
		configFile, err = os.Open(filepath.Join(dirOs, "config.json"))
		if err != nil {
			fmt.Println("Error opening config file:", err)
			return
		}
	}
	defer configFile.Close() // 确保文件在使用后关闭

	byteValue, err := io.ReadAll(configFile)
	if err != nil {
		fmt.Println("Error reading config file:", err)
		return
	}

	// 5. 将 JSON 数据解析到 config 变量中
	err = json.Unmarshal(byteValue, &AppConfig)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
	}
}
func InitAppConfig1() {
	exePath, _ := os.Executable()
  configFile, err = os.Open(filepath.Join(filepath.Dir(exePath), "config.json"))
  if err != nil {
    fmt.Println("Error opening config file:", err)
    return
  }
	defer configFile.Close() // 确保文件在使用后关闭

	byteValue, err := io.ReadAll(configFile)
	if err != nil {
		fmt.Println("Error reading config file:", err)
		return
	}

	// 5. 将 JSON 数据解析到 config 变量中
	err = json.Unmarshal(byteValue, &AppConfig)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
	}
}

// @ 打开webview
// 安装依赖:  go get github.com/jchv/go-webview2
// main.go:  独立线程运行go-weview2
go utils.OpenWebView("http://localhost" + addr)
// utils.go
func OpenWebView(url string) {
	w := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  "多线程下载器",
			Width:  1200,
			Height: 720,
			IconId: 1, // icon resource id
			Center: true,
		},
	})
	if w == nil {
		log.Fatalln("Failed to load webview.")
	}
	defer w.Destroy()
	w.SetSize(1200, 720, webview2.HintNone) // HintNone  HintFixed
	w.Navigate(url)
	w.Run()
}
// @ 托盘图标
// go get "github.com/getlantern/systray"
// main.go
//go:embed ico.ico
var iconData []byte
go utils.GenTaskBarIcon(iconData)
// utils.go
func GenTaskBarIcon(iconData []byte) {
	if runtime.GOOS == "windows" {
		systray.Run(
			func() {
				systray.SetIcon(iconData)
				// systray.SetTitle("D-Monitor")
				// systray.SetTooltip("D-Monitor 右键点击打开菜单！")
				// menuOpen := systray.AddMenuItem("打开网页", "打开系统网页")
				// systray.AddSeparator()
				menuQuit := systray.AddMenuItem("退出", "退出程序")

				go func() {
					for {
						select {
						// case <-menuOpen.ClickedCh:
						// OpenBrowser(fmt.Sprintf("http://localhost:%d/", base.RunPort))
						case <-menuQuit.ClickedCh:
							systray.Quit()
							os.Exit(0)
						}
					}
				}()
			},
			func() {
				log.Println("Systray has exited.")
			})
	}
}


`