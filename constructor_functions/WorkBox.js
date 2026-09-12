function WorkBox (x, y, w, h, imgPath, link) {
    this.x = x; //这个x就是上面括号里的x(parameters)，用于接收使用的时候传入的arguments。
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = loadImage(imgPath); //定义变量vars。
    this.link = link;

    this.diaplay = function () {
        image(this.img, this.x, this.y, this.w, this.h); //使用变量vars。
    };

    this.checkClick = function() {
    if (mouseX > this.x && mouseX < this.x + this.w &&
        mouseY > this.y && mouseY < this.y + this.h) {
      window.location.href = this.link;
    }
  };
}