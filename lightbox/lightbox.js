;(function($){
        
    var LightBox=function(settings){
        var self=this;
        this.settings={
                speed:600
        }
        $.extend(this.settings,settings||{})
        //创建遮罩和弹出框
        this.popupMask=$("<div id='G-lightbox-mask'>");
        this.popupWin=$("<div id='G-lightboc-popup'>");

        //保存body
        this.bodyNode=$(document.body);

        //渲染剩余的Dom 并且插入到body
        this.renderDOM();

        //获取图片的预览区域
        this.picViewArea=this.popupWin.find('div.lightbox-pic-view');//图片预览区域
        this.popupPic=this.popupWin.find('img.lightbox-img');
        this.picCaption=this.popupWin.find('div.lightbox-pic-caption');
        this.nextBtn=this.popupWin.find('span.lightbox-next-btn');
        this.prevBtn=this.popupWin.find('span.lightbox-prev-btn');
        this.captionTxt=this.popupWin.find('p.lightbox-pic-desc');
        this.currentIndex=this.popupWin.find('span.lightbox-of-index');
        this.closeBtn=this.popupWin.find('div.lightbox-close-btn');


        /* var lightbox=$('.js-lightbox,[data-role="lightbox"]');
        lightbox.click(function(){
            alert('1111');
        }) */

        this.groupName = null;
        this.groupData = [];//放置同一组数据的数组
        //准备开发事件委托机制，因为考虑到懒加载的问题 部分dom不能及时绑定click事件 所以进行事件委托，将click绑定到目标元素的父元素上
        this.bodyNode.delegate('.js-lightbox,*[data-role="lightbox"]',"click",function(e){
            //阻止事件冒泡  防止影响父元素点击事件
            e.stopPropagation();
            //获取当前组别的图片的信息
            var currentGroupName=$(this).data('group'); 
            //如果获取的为同一组数据，则不改变原来的组别           
            if(currentGroupName != self.groupName){
                self.groupName=currentGroupName;
                //根据当前组名获取同一组数据
                self.getGroup();
            }
            //

            //初始化弹出框
            self.initPopup($(this));
        });

        //关闭弹出
        this.popupMask.click(function(){
            $(this).fadeOut();
            self.popupWin.fadeOut();
        })

        this.closeBtn.click(function(){
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });

        this.nextBtn.hover(function(){
                    if(!$(this).hasClass('disable')&& self.groupData.length>1){
                        $(this).addClass('lightbox-next-btn-show');
                    }
        },function(){
                if(!$(this).hasClass('disable') && self.groupData.length>1){
                    $(this).removeClass('lightbox-next-btn-show');
                }
        }).click(function(e){
            if(!$(this).hasClass('disable')){
                e.stopPropagation();
                self.goto('next');
            }
        });

        this.prevBtn.hover(function(){
            if(!$(this).hasClass('disable')&& self.groupData.length>1){
                $(this).addClass('lightbox-prev-btn-show');
             }
        },function(){
            if(!$(this).hasClass('disable') && self.groupData.length>1){
                $(this).removeClass('lightbox-prev-btn-show');
            }
        }).click(function(e){            
            if(!$(this).hasClass('disable')){
                e.stopPropagation();
                self.goto('prev');
            }
        });

        //绑定窗口调整事件
        //设置定时器
        var timer = null ;
        this.clear = false;
        $(window).resize(function(){
            if(self.clear){
                window.clearTimeout(timer);
                timer=window.setTimeout(function(){
                    self.loadPicSize(self.groupData[self.index].src);
                },500); 
            }     
        }).keyup(function(e){
            var keyValue=e.which;
            if(self.clear){
                if(keyValue==37||keyValue==38){
                    self.prevBtn.click();
                }else if(keyValue==39||keyValue==40){
                    self.nextBtn.click();
                }
            }
        });

    }
    LightBox.prototype={
        goto:function(dir){
            if(dir==='next'){
                //this.groupData
                //this.index
                this.index++;
                if(this.index>=this.groupData.length-1){
                    this.nextBtn.addClass('disable').removeClass('lightbox-next-btn-show');
                } 
                if(this.index != 0){
                    this.prevBtn.removeClass('disable');
                }  
                
                
                var src=this.groupData[this.index].src;
                this.loadPicSize(src);
            }else if(dir==='prev'){
                //alert('prev');
                this.index--;
                if(this.index<=0){
                    this.prevBtn.addClass('disable').removeClass('lightbox-prev-btn-show');
                }

                if(this.index!=this.groupData.length-1){
                    this.nextBtn.removeClass('disable');
                }

                var src=this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        },
        loadPicSize:function(sourceSrc){
            //写一个方法 加载该图片的宽高信息
            var self = this;

            self.popupPic.css({width:'auto',height:'auto'}).hide();
            self.picCaption.hide();
            
            this.preLoadImg(sourceSrc,function(){

                self.popupPic.attr('src',sourceSrc);
                var picWidh=self.popupPic.width(),
                    picHeight=self.popupPic.height();
                self.changePic(picWidh,picHeight);
            })
        },
        changePic:function(width,height){
            var self = this,
                winWidth=$(window).width(),
                winHeight=$(window).height();
            //如果图片的宽高大于浏览器的宽高比 就是判断一下图片是否溢出
            var scale=Math.min(winWidth/(width+10),winHeight/(height+10),1);
            width=width*scale;
            height=height*scale;
            this.picViewArea.animate({
                                    width:width-10,
                                    height:height-10
                                    },self.settings.speed);
            this.popupWin.animate({
                                width:width-10,
                                height:height,
                                marginLeft:-(width/2),
                                top:(winHeight-height)/2
                                },self.settings.speed,function(){
                                    self.popupPic.css({
                                                    width:width-10,
                                                    height:height-10
                                    }).fadeIn();
                                    self.picCaption.fadeIn();
                                    self.clear = true;
                                });
            //设置描述文字和当前索引   
            this.captionTxt.text(this.groupData[this.index].caption);
            this.currentIndex.text('当前索引为'+(this.index+1)+'of'+this.groupData.length);
        },
        preLoadImg:function(sourceSrc,callback){
            var img = new Image();
            if(!!window.ActiveXObject){
                img.onreadystatechange=function(){
                    if(this.readyState=='complete'){
                        callback();
                    }
                }
            }else{
                img.onload=function(){
                    callback();
                }
            }
            img.src=sourceSrc;
        },
        showMaskAndPopup:function(sourceSrc,currentId){
            var self=this;
            this.popupPic.hide();
            this.picCaption.hide();
            this.popupMask.fadeIn();
            var winWidth=$(window).width(),
                winHeight=$(window).height();
            this.picViewArea.css({
                    width:winWidth/2,
                    height:winHeight/2
            })
            this.popupWin.fadeIn();

            var viewHeight=winHeight/2+10;
            this.popupWin.css({
                                width:winWidth/2+10,
                                height:winHeight/2+10,
                                marginLeft:-(winWidth/2+10)/2,
                                top:-viewHeight
                            }).animate({
                                top:(winHeight-viewHeight)/2
                            },self.settings.speed,function(){
                                //回调函数加载图片
                                self.loadPicSize(sourceSrc);

                            })
            //根据当前点击元素的id 获取图片在当前组别的索引
            this.index=this.getIndex(currentId);
            //console.log(this.index);
            var groupDataLength=this.groupData.length;
            if(groupDataLength>1){
                if(this.index === 0){
                    //this.nextBtn this.prevBtn  上下切换按钮的显示和隐藏
                    this.prevBtn.addClass('disable');
                    this.nextBtn.removeClass('disable');
                }else if(this.index === groupDataLength-1){
                    this.prevBtn.removeClass('disable');
                    this.nextBtn.addClass('disable');
                }else{
                    this.prevBtn.removeClass('disable');
                    this.nextBtn.removeClass('disable');
                }
            }
        },        
        getIndex:function(currentId){
            var index=0;
            $(this.groupData).each(function(i){
                index=i ;
                if(this.id === currentId){
                    return  false;
                }
            })
            return index;
        },
        initPopup:function(currentObj){
            var self=this,
                sourceSrc=currentObj.attr('data-source'),
                currentId=currentObj.attr('data-id');
            this.showMaskAndPopup(sourceSrc,currentId);
        },        
        getGroup:function(){
            var self=this;
            
            //根据当前的组别的名称 获取当前对象的所有对象
            var groupList=this.bodyNode.find("[data-group="+self.groupName+"]");

            //清空数组数据
            self.groupData.length=0;
            groupList.each(function(){
                self.groupData.push({
                    src:$(this).attr('data-source'),
                    id:$(this).attr('data-id'),
                    caption:$(this).attr('data-caption')
                });
            })
           // console.log(self.groupData);
        },
        renderDOM:function(){
            var strDOM="<div class='lightbox-pic-view'>"
                        +"<span class='lightbox-btn lightbox-prev-btn'></span>"
                        +"<img src='img/z1.jpg' class='lightbox-img'/>"
                        +"<span class='lightbox-btn lightbox-next-btn'></span>"
                        +"</div>"
                        +"<div class='lightbox-pic-caption'>"
                        +"<div class='lightbox-caption-area'>"
                        +"<p class='lightbox-pic-desc'>图片建行卡和 </p>"
                        +"<span class='lightbox-of-index'>当前索引：</span>"
                        +"</div>"
                        +"<div class='lightbox-close-btn'></div>"
                        +"</div>";
            //插入到popwin
            this.popupWin.html(strDOM);

            //把遮罩和弹出框插入到body
            this.bodyNode.append(this.popupMask,this.popupWin);

        }
    };
    window['LightBox']=LightBox;

})(jQuery);
