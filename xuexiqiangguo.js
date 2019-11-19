auto.waitFor();//辅助权限授予
auto.setMode("normal");

/**
 * @name:延迟函数
 */
function waitsec(params) {
    sleep(params * 1000);
    return true;
}
function waitmin(params) {
    waitsec(params * 60);
    return true;
}

/**
 * @name: 手指向上/向下滑动
 * @param: int
 */
function upslip(params){
    gesture(params * 2, [device.width * 0.5, device.height* 0.8], [device.width * 0.5, device.height* 0.8-params]);
    return true;
}
function downslip(params){
    gesture(params * 2, [540, 1124], [540, 1124+params]);
    return true;
}

/**
 * @name: 启动学习强国
 */
function startapp() {
    toastLog('启动强国app...');
    var State = launchApp("学习强国");
    if (State == false) {
        toastLog("ERROR：学习强国启动失败");
        exit();
    }
    else {
        var myhome = text("我的").clickable().findOne();
        toastLog("启动强国app成功");
    }
};

/**
 * @name: 进入个人积分主页
 */
function enterscore(){
    waitsec(1);
    nice = desc("成长总积分");
    if (nice.exists()) {
        return true;
    }
    var score = id("ll_item_view").clickable();
    while (!score.exists()) {
        var myhome = text("我的").clickable();
        if (myhome.exists()) {
            myhome.findOnce().click();
        }
        else {
            back();
        }
        waitsec(1);
        score = id("ll_item_view").clickable();
    }
    score.findOnce().click();
    return true; 
}
function enterhome(){
    waitsec(1);
    var myhome = text("我的").clickable();
    while (!myhome.exists()) {
        back();
        waitsec(1);
        myhome = text("我的").clickable();
    }
    return true; 
}


/**
 * @name: 阅读文章,评论，收藏，分享
 * @param: 
 *      diff_num: 剩下需要看的文章数目
 *      diff_time: 剩下需要看的文章时间（sec）
 *      per_paper_time: 每篇文章阅读时间
 *      comment: 评论 boolean
 *      collect: 收藏 boolean
 *      share: 分享 boolean
 */


function readpapers(diff_num, diff_time){
    toastLog("1. 阅读文章");
    enterhome();
    button = desc("学习").clickable();
    if (button.exists()) {
        button.findOnce().click();
    }
    else {
        toastLog("ERROR：>学习> 无法进入");
        exit();
    }
    title1 = className("android.widget.TextView").depth(16).text("要闻").findOne().parent().parent();
    selected = random(0, title1.childCount() - 1);
    selected = 0;
    log("(含 " + title1.childCount() + " 个主分类, 随机选取类别" + selected +")");
    //进入
    waitsec(1);
    title1.child(selected).click();

    title2 = className("android.widget.HorizontalScrollView");
    if (title2.exists()) {
        ss = title2.findOne().child(0);
        selected = random(0, ss.childCount() - 1);
        log("((含 " + ss.childCount() + " 个次分类, 随机选取类别" + selected +"))");
        waitsec(1);
        ss.child(selected).click();
    }


    //从头计数
    //paper_num, comment_num, collect_num, share_num, paper_time
    var arr = new Array(0, 0, 0, 0, 0);

    // 8篇文章
    while (arr[0] < diff_num || arr[4] < diff_time) {
        waitsec(1);
        //浏览文章
        arr = readpaper(arr, diff_num, diff_time);
        //滑动下一页面
        upslip(content_height/2);
        upslip(content_height/2);
    }
    toastLog("===任务1：完成，历时 " + arr[4] + "sec");
    return true;
}


function readpaper(arr, diff_num, diff_time) {
    //通过"2019-11-16"来定位
    my = className("android.widget.TextView").find();
    my.each(function(callback) {
        reg = RegExp(/(\d{4})-(\d{2})-(\d{2})/);
        //先判断是不是日期
        res = reg.exec(callback.text());
        if (res){
            waitsec(1);
            clickable_buttun = callback;
            max_num = 0;
            while (!clickable_buttun.clickable() && max_num < 7) {
                if (!clickable_buttun.parent()) {
                        break;
                    }
                clickable_buttun = clickable_buttun.parent();
                max_num += 1;
            }
            per_height = clickable_buttun.bounds().bottom - clickable_buttun.bounds().top;
            // log("height " + per_height);
            if (clickable_buttun.clickable())
            {
                //点击进入这篇文章
                clickable_buttun.click();
                //一篇文章最短30s
                if (diff_num == 0) {
                    per_paper_time = random(30, 40);
                }
                else {
                    per_paper_time = diff_time / diff_num;
                    if (per_paper_time < 30) {
                        per_paper_time = random(30, 40);
                    }
                }
                toastLog("1.1 第" + (arr[0] + 1) + "篇阅读...");
                for (let index = 0; index < 5; index++) {
                    waitsec(per_paper_time/5);
                    upslip(content_height/2);
                }
                            
                //点赞文章
                likes = className("android.view.View").clickable().depth(23).drawingOrder(0).indexInParent(0);
                if (likes.exists()) {
                    if (likes.find().size() == 2) {
                        likes.find()[1].click();
                    }
                    else {
                        likes.findOnce().click();
                    }
                    toastLog("1.1.1 点赞成功");
                }
                else {
                    toastLog("1.1.1 点赞失败");
                }

                //评论
                if (arr[1] < comment_diff && comment) {
                    commenting();
                    toastLog("1.1.2 评论第"+comment_diff+"次成功");
                    arr[1] += 1;
                }
                //收藏
                if (arr[2] < collect_diff && collect) {
                    collecting();
                    toastLog("1.1.3 收藏第"+collect_diff+"次成功");
                    arr[2] += 1;
                }
                //分享
                if (arr[3] < share_diff && share) {
                    sharing();
                    toastLog("1.1.4 分享第"+share_diff+"次成功");
                    arr[3] += 1;
                }
                toastLog("1.2 第" + (arr[0] + 1) + "篇阅读完成, 历时" + per_paper_time + "s");
                //时间+，数量+
                arr[4] += per_paper_time;
                arr[0] += 1
                back();
            }
        }
    })
    return arr;
}
function commenting(comment_txt){
    auto_txt = ["祖国加油，中国加油！", "我爱我的祖国！", "我为我是中国人而自豪！！"];
    if (!comment_txt) {
        comment_txt = auto_txt[random(0, auto_txt.length-1)];
    }
    button = text("欢迎发表你的观点").clickable();
    if (button.exists()) {
        button.findOnce().click();
        waitsec(1);
        setText(comment_txt);
        waitsec(1);
        button = text("发布").clickable();
        if (button.exists()) {
            button.findOnce().click();
            toastLog("评论成功");
            waitsec(1);
            button = text("删除").clickable();
            if (button.exists()){
                button.findOnce().click();
                waitsec(1);
                text("确认").clickable().findOnce().click();
                waitsec(0.5);
                toastLog("删除评论成功");
                return true;
            }
            else {
                toastLog("删除评论失败");
            }
            //删除不成功也继续
            return true;
        }
    }
    toastLog("评论失败");
    exit();
}
function collecting(){
    //点击收藏按钮
    button = className("android.widget.ImageView").clickable().depth(10).drawingOrder(3).indexInParent(2);
    if (button.exists()) {
        button.findOnce().click();
        toastLog("收藏成功");
        waitsec(0.5);
        return true;
    }
    toastLog("收藏失败");
    // click(865, 2187);
}
function sharing(){
    //点击分享按钮
    button = className("android.widget.ImageView").clickable().depth(10).drawingOrder(4).indexInParent(3);
    if (button.exists()) {
        button.findOnce().click();
        waitsec(1);
        button = text("分享到学习强国");
        if (button.exists()) {
            button.findOnce().parent().click();
            //分享到最近联系人第一个
            waitsec(1);
            button = className("android.widget.RelativeLayout").clickable();
            //toastLog(button.find().size());
            button.click();
            toastLog("分享成功");
            return true;
        }
    }
    toastLog("分享失败");
    exit();
    // click(980, 2187);
    // waitsec(1);
    // //分享到学习强国
    // click(135, 1473);
    // waitsec(1);
    // //分享到自己
    // click(540, 864);
    // waitsec(1);
    // //发送按钮
    // submit_buttun= text("发送").findOnce();
    // if (submit_buttun) {
    //     submit_buttun.click();
    //     return true;
    // }
    // else {
    //     toast("发送失败");
    // }
}

/**
 * @name: 看视频
 */
function watchvideo(diff_num, diff_time){
    //看视频6个
    //合计18min
    toastLog("2. 观看视频...");
    enterhome();
    var button = desc("电视台");
    if (button.exists()) {
        button.findOnce().click();
    }
    else {
        toastLog("ERROR：>电视台 无法进入");
        exit();
    }

    title1 = className("android.widget.TextView").depth(16).text("学习视频").findOne().parent().parent();
    selected = random(0, title1.childCount() - 1);
    selected = 1;
    //过滤掉BUG页面<看电视|看幕课...>12,11,10, 9
    while (selected == 3 || selected == 6 || selected == 8 || selected == 9 || selected == 10 || selected == 11 || selected == 12) {
        selected = random(0, title1.childCount() - 1);
    }

    log("(含 " + title1.childCount() + " 个主分类, 随机选取类别" + selected +")");
    //进入
    waitsec(1);
    title1.child(selected).click();

    title2 = className("android.widget.HorizontalScrollView");
    if (title2.exists()) {
        ss = title2.findOne().child(0);
        selected = random(0, ss.childCount() - 1);
        log("((含 " + ss.childCount() + " 个次分类, 随机选取类别" + selected +"))");
        waitsec(1);
        ss.child(selected).click();
    }
    
    var video_time = 0;
    var video_num = 0;
    while (video_num < diff_num || video_time < diff_time){
        var video = className("android.widget.TextView").find();
        video.each(function (callback){
            reg = RegExp(/(\d{2}):(\d{2})/);
            //先判断是不是视频时长
            res = reg.exec(callback.text());
            if (res) {
                //寻找到父类可以点击的元素（4层）
                clickable_buttun = callback;
                max_num = 0;
                while (!clickable_buttun.clickable() && max_num < 8) {
                    if (!clickable_buttun.parent()) {
                        break;
                    }
                    clickable_buttun = clickable_buttun.parent();
                    max_num += 1;
                }
                per_height = clickable_buttun.bounds().bottom - clickable_buttun.bounds().top;
                // log("height " + per_height)
                //判断是否在本页面可显示的地方（怕出意外，会被服务器知道爬虫之类的软件！）
                var left = callback.bounds().left;
                var right = callback.bounds().right;
                var top = callback.bounds().top;
                var bottom = callback.bounds().bottom;
                if (clickable_buttun.clickable()) {
                    if (left > 0 && right <device.width && top > header_down && bottom <footer_top){
                        waitsec(1);
                        clickable_buttun.click();
                        //流量选择播放
                        liuliang = text("继续播放").clickable();
                        if (liuliang.exists()){
                            waitsec(1);
                            liuliang.findOnce().click();
                        }
                        //单个视频观看时长 = 视频本身时长
                        time = parseInt(res[1]) * 60 + parseInt(res[2]);
                        toastLog("2.1 第" + (video_num + 1) + "个视频" + callback.text());
                        //视频太长了
                        if (time > (diff_time - video_time)) {
                            //一个视频最短1.5min
                            if (diff_time < 90) {
                                whatching = random(30, 40);
                                
                            }
                            else {
                                //如果还剩下很多视频需要看，不止一个，就要分配均匀
                                if (video_num != 0) {
                                    whatching += diff_time - video_num * 60 * 1.5;
                                }
                                else {
                                    whatching += diff_time;
                                }
                                
                            }
                        }
                        else {
                            whatching = time;
                            
                        }
                        video_time += whatching;
                        waitsec(whatching);
                        video_num += 1;
                        toastLog("2.2 第" + (video_num) + "个视频完成, 历时" + whatching + "s");
                        back();
                    }
                }
            }
        })
        upslip(content_height/2);
        upslip(content_height/2);
        upslip(100);
        waitsec(2);
    }
    toastLog("===任务2：完成，历时 " + diff_time + "sec");
    waitsec(1);
    return true;
}

//订阅
function subscribe(subscribe_need) {
    waitsec(1);
    log("1231232121");
    enterscore();
    subscribe_go.click();
    subscribing = 0;
    //一次最多移动9个, 也只能截图判断9个
    max_num = 9;
    waitsec(1);
    button = className("android.widget.LinearLayout").depth(15).drawingOrder(3).indexInParent(2);
    //当前找到的订阅按钮数量
    toastLog("当前找到的订阅按钮数量 " + button.find().size());
    slip_bounds = button.findOnce().parent().bounds();
    per_height = slip_bounds.bottom - slip_bounds.top;
    log("per_height" +per_height);

    click_loc = button.findOnce(0).bounds(); // .centerX();
    click_loc_width = click_loc.right - click_loc.left;
    click_loc_height = click_loc.bottom - click_loc.top;
    log("click_loc" + click_loc);

    //一次最多移动9个
    // upslip(190 * max_num);

    if (files.exists(config_file)) {
        content = files.read(config_file);
        reg = RegExp(/subscribed=(\d+)|/);
        subscribed_num = parseInt(reg.exec(content)[1]);
        log(subscribed_num);
        log("content" + content);
    }
    else {
        subscribed_num = 0;
        up_footer = false;
        while (!up_footer && subscribing < subscribe_need) {
            toastLog("there1");
            // 截图
            // 已订阅 #FFF2F3F5, #F2F3F5 灰色
            // 未订阅 #FFE32416, #E32416 红色
            if (!requestScreenCapture()) {
                toast("请求截图失败!");
                exit();
            }
            var img = captureScreen();
            toastLog("there2");
            waitsec(capturetime);
            var i = 0;
            button.find().each(function (callback) {
                callback_bounds = callback.bounds();
                //只能截图判断9个
                if (i < 9) {
                    waitsec(0.6);
                    var point = findColor(img, "#E32416", {
                        region: [callback_bounds.left, callback_bounds.top, callback_bounds.centerX() - callback_bounds.left, callback_bounds.centerY() - callback_bounds.top],
                        threshold: 4
                    });
                    if(point){
                        log("订阅+1");
                        callback.click();
                        subscribe_need += 1;
                        subscribing += 1;
                    }
                    else {
                        subscribed_num += 1;
                    }
                }
                i += 1;
            })
            //一次最多移动9个
            upslip(190 * max_num);
            //判断是否到底部
            footer = className("android.widget.TextView").depth(16).drawingOrder(2).indexInParent(0);
            if (footer.exists()) {
                if (footer.findOnce().bounds().top < device.height) {
                    if (subscribing < subscribe_need) {
                        a = className("android.widget.TextView").clickable(false).depth(13).drawingOrder(3).indexInParent(0);
                        if (a.exists()) {
                            a.findOnce().click();
                        }
                    }
                    else {
                        up_footer = true;
                    }
                }
            }
            waitsec(1);
        }
        files.create(config_file);
        text = "subscribed=" + subscribed_num + "|";
        files.write(config_file, text);
    }
}


/**
 * @name: 每日答题
 */
function Qday() {
    if (className("ListView").exists()){
        me = className("ListView").findOnce().child(0).child(0).child(0);
        if (me.className() == "android.widget.RadioButton") {
            log("radio:" + "这是个单选题");
            if (!requestScreenCapture()) {
                toast("请求截图失败!");
                exit();
            }
            log("here");
            var img = captureScreen();
            var color = images.pixel(img, 100, 100)
            log(colors.toString(color));
            // question = className("android.view.View").clickable(false).depth(22).indexInParent(1).findOnce().desc();
            // var scorereg = RegExp(/.*(\S{2})(\s{2,})(\S{2}).*/);
            // res = scorereg.exec(question);
            // log(res);
    
            desc("查看提示").click();
            waitsec(1);
            point = className("android.view.View").clickable().depth(22).indexInParent(0).findOnce().desc();
            // start = point.search(res[1]) + 2;
            // end = point.search(res[3]);
            // answer = point.slice(start, end)
            
            list = className("ListView").findOnce();
            var answer = new Array(2);
            for(var i = 0; i < list.childCount(); i++){
                var header = list.child(i).child(0).child(1);
                var content = list.child(i).child(0).child(2).desc();
                if (point.search(content)) {
                    locus = point.search(content);
                    log("存在"); 
                    // content.click();
                    // desc("确定").click();
                }
            }
        }
        else {
            //"android.widget.CheckButton"
        }
    }
    else{
        // me = desc("填空题").findOnce().parent().parent().child(1);
        // question_prefix = me.child(0).desc();
        // question_suffix = me.child(2).desc();
        // log(question_prefix);
        // log(question_suffix);
        if (!requestScreenCapture()) {
            toast("请求截图失败!");
            exit();
        }
        // 截图
        log("here");
        var img = captureScreen();
        var color = images.pixel(img, 100, 100)
        log(colors.toString(color));
    }
}
// console.show();
// Qday();
// if (!requestScreenCapture()) {
//     toast("请求截图失败!");
//     exit();
// }
// log("here");
// var img = captureScreen();
// var color = images.pixel(img, 100, 100)
// log(colors.toString(color));



console.show();
startapp();
//一直保持屏幕常亮
device.keepScreenOn();
//此选项用于分辨率差异的选项
// setScreenMetrics(1080, 2248);
//定义footer y轴数值
var footer_top = desc("学习").findOnce().bounds().top;
var header_down = className("android.widget.TextView").text("要闻").findOnce().parent().bounds().bottom;
var content_height = footer_top - header_down;


var comment = true; //是否自动评论
var comment_txt = ""; //""表示自动填词
var collect = true; //是否自动收藏(依赖于分辨率)
var share = true; //是否自动分享(依赖于分辨率)

//存储阅读分数差(read_num, read_time)
var read_diff = new Array(0, 0);
//存储看视频分数差(watch_num, watch_time)
var watch_diff = new Array(0, 0);
var collect_diff = 0;
var share_diff = 0;
var comment_diff = 0;
var subscribe_diff = 0;


var font_height = 80;
var capturetime = 1;

var config_file = "/sdcard/clsteam.txt";
//没有文件创建文件
// files.create(config_file);
//删除文件
// files.remove(config_file);


//进入个人积分主页
enterscore();
var xy = desc("登录").findOne();
var list = xy.parent().parent().parent();
var scorereg = RegExp(/.*(\d+).*\/.*(\d+).*/);
//找到为止
for(var i = 0; i < list.childCount(); i++){
    sel = list.child(i);
    var title = sel.child(0).child(0).desc();
    var rule = sel.child(1).desc();
    var score = sel.child(2).desc();
    var finish = sel.child(3).desc();
    var go = sel.child(3);
    if (finish == "已完成") {
        continue;
    }
    else {
        if (title == "阅读文章") {
            res = scorereg.exec(score);
            read_diff[0] = res[2] - res[1];
        }
        if (title == "文章学习时长") {
            res = scorereg.exec(score);
            read_diff[1] = res[2] - res[1];
        }
        if (title == "视听学习") {
            res = scorereg.exec(score);
            watch_diff[0] = res[2] - res[1];
        }
        if (title == "视听学习时长") {
            res = scorereg.exec(score);
            watch_diff[1] = res[2] - res[1];
        }
    
        if (title == "每日答题") {
            res = scorereg.exec(score);
            Qday_diff = res[2] - res[1];
        }
        // if (title == "每周答题") {
        //     res = scorereg.exec(score);
        //     comment_diff = res[2] - res[1];
        // }
        // if (title == "专项答题") {
        //     res = scorereg.exec(score);
        //     comment_diff = res[2] - res[1];
        // }
        // if (title == "挑战答题") {
        //     res = scorereg.exec(score);
        //     comment_diff = res[2] - res[1];
        // }
    
        if (title == "订阅") {
            res = scorereg.exec(score);
            subscribe_diff = res[2] - res[1];
            var subscribe_go = go;
        }
    
        if (title == "收藏") {
            res = scorereg.exec(score);
            collect_diff = res[2] - res[1];
        }
        if (title == "分享") {
            res = scorereg.exec(score);
            share_diff = res[2] - res[1];
        }
        if (title == "发表观点") {
            res = scorereg.exec(score);
            comment_diff = res[2] - res[1];
        }
    }
}

//执行部分
toastLog("==任务1：阅读文章 + 文章学习时长 + 评论 + 收藏 + 分享");
if (read_diff[0] || read_diff[1]) {
    readpapers(read_diff[0], read_diff[1] * 2 * 60);
}
else {
    toastLog("==任务1已完成！");
}
toastLog("==任务2：视听学习 + 视听学习时长");
if (watch_diff[0] || watch_diff[1]) {
    watchvideo(watch_diff[0], watch_diff[1] * 3 * 60 );
}
else {
    toastLog("==任务2已完成！");
}
toastLog("==任务3：订阅");
if (subscribe_diff != 0){
    subscribe(subscribe_diff);
}
else {
    toastLog("==任务3已完成！");
}

device.cancelKeepingAwake();
