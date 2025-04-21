# 接口

## 数据列表接口
https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Mac&milestone=134

eg: stable: https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Mac&num=60&offset=1
beta: https://chromiumdash.appspot.com/fetch_releases?channel=Beta&platform=Mac&num=6&offset=6

参数说明：
- offset 从0开始
- num 一次获取的数量
- channel 版本类型 Stable / Beta / Dev / Canary
- platform 平台 Mac/Window/Linux
- milestone 大版本号
返回数据说明：
```
[
  {
    "channel": "Stable",
    "chromium_main_branch_position": 1427262,
    "hashes": {
      "angle": "079266db445215380befce453b1ab3bbdfeaf73d",
      "chromium": "de2eb485a1951079e63bdb57ce25544d2dc79c15",
      "dawn": "53dfda5e9d07d58b43cea66b8153c55dd751ff88",
      "devtools": "ad4e2fc82183b1463ac870818c28680bbc3de889",
      "pdfium": "2919d07ee57020e3e4b66cce45c61104d80304d2",
      "skia": "5a44cdd70f04aa65fa063caa1a7e3028d75236f8",
      "v8": "e2591684c45463aa1e46ebefc3fd35deee63f37c",
      "webrtc": "9e5db68b15087eccd8d2493b4e8539c1657e0f75"
    },
    "milestone": 135,
    "platform": "Mac",
    "previous_version": "135.0.7049.86",
    "time": 1744748247181,
    "version": "135.0.7049.95"
  }
  ] 
```

## 下载地址获取接口

https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=<platform>/<chromium_main_branch_position>

参数说明

- platform：选择对应的平台：
   - 对于 macOS ARM (M1/M2/M3)，选择 `Mac_Arm`
   - 对于 Intel macOS，选择 `Mac`
   - 对于 Windows，选择 `Win` 或 `Win_x64`
   - 对于 Linux，选择 `Linux` 或 `Linux_x64`


## 大版本接口

https://chromiumdash.appspot.com/fetch_milestone_schedule?offset=1

获取最新的一个版本的时间