const Module2 = {
    onRuntimeInitialized() {
        const medias = {
            audio: false,
            video: {
                facingMode: { exact: "environment" },
                width: 1920,
                height:1080,
            }
        };
        const promise = navigator.mediaDevices.getUserMedia(medias);

        promise.then(successCallback).catch(errorCallback);
    }
};

function successCallback(stream) {
    //カメラからの入力のためのvideo
    const video = document.getElementById('video');
    //ドット認識のためのcanvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    //プレビューのためのcanvas
    const preview = document.getElementById('preview');
    const preview_ctx = preview.getContext('2d');

    video.oncanplay = () => {
        const width = video.clientWidth;
        const height = video.clientHeight;
        console.log(width + ":" + height);

        let isAnalyzing = false;//分析中かのフラグ　いらないかも

        //切り抜く一辺の長さを計算する
        const l = Math.floor(Math.min(width, height) * 0.2);
        //切り抜く範囲の左上の座標を計算する
        const lx = Math.floor((width - l) / 2);
        const ty = Math.floor((height - l) / 2);

        //プレビュー画面の高さを計算
        let preveiw_height = Math.floor(window.innerHeight);
        //切り抜いた画像をずらす　が上から結果画像が表示されるので見えない　デバッグ用
        canvas.style.top = preveiw_height + 'px';
        canvas.style.position = "absolute";
        canvas.width = l;
        canvas.height = l;

        //カメラのプレビュー用の設定
        preview.style.top = '0px';
        preview.style.position = "absolute";
        preview.width = window.innerWidth;
        preview.height = preveiw_height;

        //プレビューを作るためにどこを切り抜くかのための計算
        const preview_h = Math.floor(width * preveiw_height / window.innerWidth);
        const preview_ty = Math.floor((height - preview_h) / 2);

        //切り抜いた画像の保存場所
        let small_src = new cv.Mat(l, l, cv.CV_8UC4);
        //プレビューの画像用
        let preview_src = new cv.Mat(preveiw_height, window.innerWidth, cv.CV_8UC4);
        //AR用の3体のミャクミャクを生成する
        Create3Myakmyak();

        processVideo();

        function processVideo() {
            //videoの(lx,ty)からlxlだけ切り抜いたものを、ctxの(0,0)からlxlの範囲に描画
            ctx.drawImage(video, lx, ty, l, l, 0, 0, l, l);

            //ctxの(0,0)からlxlの範囲のデータをセット(Matに変換)
            small_src.data.set(ctx.getImageData(0, 0, l, l).data);

            //プレビュー用画像を切り抜く
            preview_ctx.drawImage(video, 0, preview_ty, width, preview_h, 0, 0, window.innerWidth, preveiw_height);
            preview_src.data.set(preview_ctx.getImageData(0, 0, window.innerWidth, preveiw_height).data);

            //判定よう画像のピントのあい具合を計算
            let sharpness = calcSharpness(small_src);

            //判定中でなく　ピントの合い具合が規定値を超えていて　全員表示していなかったら
            if (isAnalyzing == false && sharpness > 40 && (isAllVisible()==false)) {
                console.log(sharpness);
                console.log(video.clientWidth);
                console.log(video.clientHeight);
                //判定中にする　がいらなくね
                isAnalyzing = true;
                //downloadMat(small_src, "image_cam_sq_02.jpg");
                //画像から点情報を取得してinputフィールドに入れる　これでC++から参照できる
                document.getElementById("input1").value = detect_dot_csv(small_src);
                //点情報からドットコードを取得
                let result = _AnalyzeDotCSV_input();
                console.log(result);
                //解析が終わった
                isAnalyzing = false;
                //結果を表示する
                showResult(result);
            }
            //全員表示していなかったら
            if (isAllVisible()==false) {
                //プレビュー用に四角を書く
                drawRect(preview_src, 0.2);
            }
            //書いたものを見せる
            cv.imshow(preview, preview_src)

            //よくわからないけど次のフレームでも呼ぶってことかな？？
            requestAnimationFrame(processVideo);
        }
        //引数の画像のピントの合い具合を返す
        function calcSharpness(img) {
            //console.log(img.size());
            let gray = new cv.Mat()
            cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);
            let laplacian = new cv.Mat();
            cv.Laplacian(gray, laplacian, gray.depth(), 3);
            let myMean = new cv.Mat(1, 1, cv.CV_64F);
            let myStddev = new cv.Mat(1, 1, cv.CV_64F);
            cv.meanStdDev(img, myMean, myStddev);
            let res = myStddev.doubleAt(0, 0);
            gray.delete();
            laplacian.delete();
            myMean.delete();
            myStddev.delete();
            return res;            
        }
        //引数の画像の点情報をcsv形式で返す　長い文字列が返ると思われ
        function detect_dot_csv(img) {
            let block_size = 7;
            let bias = 15;

            //グレースケールする
            let gray = new cv.Mat();
            cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);
            //二値化する　二値化したらグレースケール画像はいらない
            let bin_img = new cv.Mat();
            cv.adaptiveThreshold(gray, bin_img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, block_size, bias);
            gray.delete();

            //白黒反転させる　反転させたら元画像はいらない
            let image_bitnot = new cv.Mat();
            cv.bitwise_not(bin_img, image_bitnot);
            bin_img.delete();

            //点の連結成分を調べる　調べたら反転画像はいらない
            let image_labels = new cv.Mat();
            let stats = new cv.Mat();
            let centroids = new cv.Mat();
            let n_labels = cv.connectedComponentsWithStats(image_bitnot, image_labels, stats, centroids, 4);
            image_bitnot.delete();

            //点を数える配列の準備　念のため初期化
            let m_dotCounter = new Int32Array(img.rows);
            for (let i = 0; i < m_dotCounter.length; i++) {
                m_dotCounter[i] = 0;
            }

            //連結成分ごとに見ていく　終わったら連結成分の情報はいらない
            let allDotInfo = new Array();
            let allDotInforsCounter = 0;
            for (let label = 1; label < n_labels; label++) {
                let area = stats.intAt(label, cv.CC_STAT_AREA);
                let center_x = parseInt(centroids.doubleAt(label, 0));//データはintに収まるがサイズがdoubleなのでdoubleAtでアクセス
                let center_y = parseInt(centroids.doubleAt(label, 1));

                if (0 < area && area < 35) {
                    //console.log(area);
                    let tmp = new Int32Array(3);
                    tmp[0] = center_x;
                    tmp[1] = center_y;
                    tmp[2] = area;
                    allDotInfo.push(tmp);

                    m_dotCounter[center_y]++;
                    allDotInforsCounter++;
                }
            }
            image_labels.delete();
            stats.delete();
            centroids.delete();

            //点情報を並べ替える
            allDotInfo.sort((a, b) => (a[1] == b[1] ? a[0] - b[0] : a[1] - b[1]));

            //点情報を文字列にしていく　改行文字が使えないので代わりに/
            let dotInfo = new String();
            dotInfo += new String(img.cols);
            dotInfo += ",";
            dotInfo += new String(img.rows);
            dotInfo += ",";
            dotInfo += new String(allDotInforsCounter);
            dotInfo += "/";

            for (let i = 0; i < allDotInforsCounter; i++) {
                dotInfo += new String(i);
                dotInfo += ",";
                dotInfo += new String(allDotInfo[i][0]);
                dotInfo += ",";
                dotInfo += new String(allDotInfo[i][1]);
                dotInfo += ",";
                dotInfo += new String(allDotInfo[i][2]);
                dotInfo += "/";
            }
            //dotLink情報を作っていくがこれはdotInfoから作れるので受け取った先で作るようにすれば渡す文字数を減らせる
            let dotLink = new String("0/");
            let counter = 0;
            for (let i = 0; i < img.rows - 1; i++) {

                counter += m_dotCounter[i];
                dotLink += new String(counter);
                dotLink += "/";
            }
            return dotInfo + "$" + dotLink;
        }
        //引数のMatをnameでダウンロードできる　デバッグ用
        function downloadMat(image,name) {
            console.log("save Mat");
            let canvas = document.createElement("canvas");
            cv.imshow(canvas, image);
            const a = document.createElement("a");
            a.href = canvas.toDataURL("image/jpeg", 0.75); // PNGなら"image/png"
            a.download = name;
            a.click();
        }
        //引数のimageに四角を書く　大きさはrectratioで横幅に対する比で設定
        function drawRect(image, rectratio) {
            let l = Math.floor(image.cols * rectratio/2);
            let cx = Math.floor(image.cols / 2);
            let cy = Math.floor(image.rows / 2);
            let lt = new cv.Point(cx - l, cy - l);
            let rd = new cv.Point(cx + l, cy + l);
            cv.rectangle(image, lt, rd, new cv.Scalar(255, 0, 0,255), 3);
        }
        //引数の結果の値から結果の画像を表示する
        function showResult(result) {
            //範囲外なら何もしない
            if (result < 1 || 35 < result) return;
            if      (result == 1) VisibleMyakmyak(myakmyak_japan, '#myakmyak_japan');
            else if (result == 2) VisibleMyakmyak(myakmyak_english, '#myakmyak_english');
            else if (result == 3) VisibleMyakmyak(myakmyak_mexican, '#myakmyak_mexican');
        }
    };

    video.srcObject = stream;
};
var myakmyak_japan = null;
var myakmyak_english = null;
var myakmyak_mexican = null;
function InvisibleAllMyakmyak() {
    if (myakmyak_japan != null) myakmyak_japan.object3D.visible = false;
    if (myakmyak_english != null) myakmyak_english.object3D.visible = false;
    if (myakmyak_mexican != null) myakmyak_mexican.object3D.visible = false;
}
//ミャクミャクをカメラの前でカメラを向いて表示してしゃべる 表示以外もやっているので名前を適切に変えたい
function VisibleMyakmyak(myakmyak, sound_src) {
    if (myakmyak.object3D.visible == true) return;
    InvisibleAllMyakmyak();
    //作成されていて、ひょうじされていないなら
    if (myakmyak != null && myakmyak.object3D.visible == false) {
        //表示する
        myakmyak.object3D.visible = true;
        //カメラの4m前に移動させる　mと書いたが実際の単位は不明
        const cameraWrapper = document.getElementById("camera-wrapper");
        const camera = cameraWrapper.querySelector("a-camera");
        myakmyak.object3D.position.copy(camera.object3D.localToWorld(new THREE.Vector3(0, 0, -4)));
        myakmyak.object3D.lookAt(camera.object3D.getWorldPosition(new THREE.Vector3()));
        //サウンドをあらかじめ紐づけして再生したら、音声が表示されるより速かったので動的紐づけでやる
        myakmyak.setAttribute('sound', {
            'src': sound_src,
            'volume': 10,
            'autoplay': false,
            'loop': false,
        });
        myakmyak.components.sound.playSound();
    }
}
//全員表示したかどうか
function isAllVisible() {
    if (myakmyak_japan == null || myakmyak_japan.object3D.visible == false) return false;
    if (myakmyak_english == null || myakmyak_english.object3D.visible == false) return false;
    if (myakmyak_mexican == null || myakmyak_mexican.object3D.visible == false) return false;
    return true;
}
//3体ののミャクミャクを生成する
function Create3Myakmyak() {
    if (myakmyak_japan == null) myakmyak_japan = CreateMyakmyak();
    if (myakmyak_english == null) myakmyak_english = CreateMyakmyak();
    if (myakmyak_mexican == null) myakmyak_mexican = CreateMyakmyak();
}
//1体のミャクミャクを生成し返す
function CreateMyakmyak() {
    var body = document.querySelector('a-scene');
    //作成する
    var myakmyak = document.createElement('a-entity');
    //モデルを設定する
    myakmyak.setAttribute('gltf-model', '#myakmyak');
    //位置、大きさ、回転を指定する　位置は後で上書きする
    myakmyak.object3D.position.set(0, 0, 0);
    myakmyak.object3D.scale.set(1, 1, 1);
    myakmyak.object3D.rotation.set(0, 0, 0);
    //アニメーションの設定
    myakmyak.setAttribute('animation-mixer', '');
    //シーンの子にする
    body.appendChild(myakmyak);
    //表示は別タイミングでするので今は非表示
    myakmyak.object3D.visible = false;
    return myakmyak;
}
function errorCallback(err) {
    alert(err);
};