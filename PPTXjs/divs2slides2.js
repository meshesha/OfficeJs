/**
 * divs2slides.js
 * Ver : 2.0.0
 * Author: meshesha , https://github.com/meshesha
 * LICENSE: MIT
 * url:https://github.com/meshesha/divs2slides
 */
(function( $ ){
    var configObj = {
        init: function(){
            var data = configObj.data;
            var options = data.options;
            var divId = data.divId;
            $("#"+divId+" .slide").hide();        
            if(options.slctdBgClr != false){
                var preBgClr = $(document.body).css("background-color");
                options.prevBgColor = preBgClr;
                $(document.body).css("background-color",options.slctdBgClr)
            }
            if (options.nav){
                // Create navigators 
                $("#"+divId).prepend(
                    $("<div></div>").attr({
                        "class":"slides-toolbar",
                        "style":"width: 100%; padding: 10px; text-align: center; color: "+options.navTxtColor+";" ////New for Ver: 1.2.1
                    })                
                );
                $("#"+divId+" .slides-toolbar").prepend(
                    $("<button></button>").attr({
                        "id":"slides-next",
                        "class":"slides-nav",
                        "alt":"Next Slide",
                        "style":"float: right; "
                    }).html(options.navNextTxt).on("click", configObj.nextSlide)
                );
                if(options.showTotalSlideNum){
                    $("#"+divId+" .slides-toolbar").prepend(
                        $("<span></span>").attr({
                            "id":"slides-total-slides-num"/*,
                            "class":"slides-nav"*/
                        }).html(data.totalSlides)
                    );
                }
                if(options.showSlideNum && options.showTotalSlideNum){
                    $("#"+divId+" .slides-toolbar").prepend(
                        $("<span></span>").attr({
                            "id":"slides-slides-num-separator"/*,
                            "class":"slides-nav"*/
                        }).html(" / ")
                    );
        
                }
                if(options.showSlideNum){
                    $("#"+divId+" .slides-toolbar").prepend(
                        $("<span></span>").attr({
                            "id":"slides-slide-num"/*,
                            "class":"slides-nav"*/
                        }).html(data.slideCount)
                    );
                }
                $("#"+divId+" .slides-toolbar").prepend(
                    $("<button></button>").attr({
                        "id":"slides-prev",
                        "class":"slides-nav",
                        "alt":"Prev. Slide",
                        "style":"float: left;"
                    }).html(options.navPrevTxt).bind("click", configObj.prevSlide)
                );
            }
            // Go to first slide
            configObj.gotoSlide(1);
        },
        nextSlide: function(){
            var data = configObj.data;
            var isLoop = data.loop;
            if (data.slideCount < data.totalSlides){
                    configObj.gotoSlide(data.slideCount+1);
            }else{
                if(isLoop){
                    configObj.gotoSlide(1);
                }
            }
            return this;
        },
        prevSlide: function(){
            var data = configObj.data;
            if (data.slideCount > 1){
                configObj.gotoSlide(data.slideCount-1);
                //configObj.data.slideCount--;
            }
            return this;
        },
        gotoSlide: function(idx){
            var index = idx - 1;
            var data = configObj.data;
            var slides = data.slides;
            var prevSlidNum = data.prevSlide;
            var transType = data.transition; /*"slid","fade","default" */
            if(transType=="random"){
                var tType = ["","default","fade","slid"];
                var randomNum = Math.floor(Math.random() * 3) + 1; //random number between 1 to 3
                transType = tType[randomNum];
            }
            var transTime = 1000*(data.transitionTime);
            if (slides[index]){
                var nextSlide = $(slides[index]);
                if ($(slides[prevSlidNum]).is(":visible")){ //remove "index >= 1 &&" bugFix to ver. 1.2.1
                    if(transType=="default"){
                        $(slides[prevSlidNum]).hide(transTime);
                    }else if(transType=="fade"){
                        $(slides[prevSlidNum]).fadeOut(transTime);
                    }else if(transType=="slid"){
                        $(slides[prevSlidNum]).slideUp(transTime);
                    }
                }
                if(transType=="default"){
                    nextSlide.show(transTime); 
                }else if(transType=="fade"){
                    nextSlide.fadeIn(transTime);
                }else if(transType=="slid"){
                    nextSlide.slideDown(transTime);
                }
                data.prevSlide = index;
                configObj.data.slideCount = idx;
                $("#slides-slide-num").html(idx);
            }
            return this;
        },
        keyDown: function(event){
            event.preventDefault();
            var key = event.keyCode;
            //console.log(key);
            var data = configObj.data;
            switch(key){
                case(37): // Left arrow
                case(8): // Backspace
                    if(data.isSlideMode && data.isEnblePrevBtn){
                        configObj.prevSlide();
                    }
                    break;
                case(39): // Right arrow
                case(32): // Space 
                case(13): // Enter 
                    if(data.isSlideMode  && data.isEnbleNextBtn){
                        configObj.nextSlide();
                    }
                    break; 
                case(27): //Esc
                    //if in auto mode , stop auto mode TODO
                    if(data.isSlideMode){
                        var div_id = data.divId;
                        $("#"+div_id+" .slide").hide();
                        configObj.gotoSlide(1);               //bugFix to ver. 1.2.1
                    }
                    break;
                case(46): // Delete
                    if(data.isSlideMode){
                        configObj.closeSileMode();
                        data.isSlideMode = false;
                    }
                    break;
                case(116): //F5
                    if(!data.isSlideMode){
                        configObj.startSlideMode();
                        data.isSlideMode = true;
                    }
                    break;
                case(113): // F2
                    if(data.isSlideMode){
                        configObj.fullscreen();
                    }
                break;
                case(119): // F8
                    if(data.isSlideMode){
                        configObj.startAutoSlide();
                        //TODO : ADD indication that it is in auto slide mode
                    }
                break;
            }
            return true;
        },
        startSlideMode: function(){
            configObj.init();
        },
        closeSileMode: function(){
            var data = configObj.data;
            data.isSlideMode = false;
            var div_id= data.divId;
            $("#"+div_id+" .slides-toolbar").hide();
            $("#"+div_id+" .slide").show();
            $(document.body).css("background-color",configObj.data.prevBgColor);
            if(data.isLoop){
                clearInterval(data.loopIntrval);
                data.isLoopMode = false;
            }
            
        },
        startAutoSlide: function(){
            var data = configObj.data;
            var isAutoSlideMode = data.isAutoSlideMode;
            if(!isAutoSlideMode){
                //data.isAutoSlideMode = true;
                var isStrtLoop = data.isLoop;
                //hide/show and disable/enable next and prev btn
                if(!isStrtLoop){
                    if(data.nav){
                        var div_Id = data.divId;
                        $("#"+div_Id+" .slides-toolbar .slides-nav").hide();
                    }
                    data.isEnbleNextBtn = false;
                    data.isEnblePrevBtn = false;
                }else{
                    if(data.nav){
                        var div_Id = data.divId;
                        $("#"+div_Id+" .slides-toolbar .slides-nav").show();
                    }
                    data.isEnbleNextBtn = true;
                    data.isEnblePrevBtn = true;

                }
                ///////////////////////////////
                
                var t = data.timeBetweenSlides + data.transitionTime;
                
                var slideNums = data.totalSlides;
                var isRandomSlide = data.randomAutoSlide;
                if((t && !isStrtLoop) || (isRandomSlide && !isStrtLoop)){
                    var timeBtweenSlides = t*1000; //milisecons
                    data.isLoopMode = true;
                    data.loopIntrval = setInterval(function(){
                        if(isRandomSlide){
                            var randomSlideNum = Math.floor(Math.random() * slideNums) + 1;
                            configObj.gotoSlide(randomSlideNum);
                        }else{
                            configObj.nextSlide();
                        }
                    }, timeBtweenSlides);
                }else if(isStrtLoop){
                    clearInterval(data.loopIntrval);
                    data.isLoopMode = false;
                }
            }
        },
        fullscreen: function(){

            if (!document.fullscreenElement &&    
                !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
              } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              }
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              }
            }
            
        }

    };
    $.fn.divs2slides = function( options ) {
        var settings = $.extend({
            // These are the defaults.
            first: 1,
            nav: true, /** true,false : show or not nav buttons*/
            navTxtColor: "black", /** color */
            navNextTxt:"&#8250;",
            navPrevTxt: "&#8249;",
            keyBoardShortCut: true, /** true,false */
            showSlideNum: true, /** true,false */
            showTotalSlideNum: true, /** true,false */
            autoSlide:false, /** false or seconds (the pause time between slides) , F8 to active(condition: keyBoardShortCut: true) */
            randomAutoSlide: false, /** true,false ,(condition: autoSlide:true */ 
            loop: false,  /** true,false */
            background: false, /** false or color*/
            transition: "default", /** transition type: "slid","fade","default","random" , to show transition efects :transitionTime > 0.5 */
            transitionTime: 1 /** transition time in seconds */
        }, options );
        var target = $(this);
        var divId = target.attr("id");
        var slides = target.children();
        var totalSlides = slides.length-1;
        var prevBgColor;        
        var slideCount = settings.first
        configObj.data = {
            options: {
                nav: settings.nav,
                navTxtColor: settings.navTxtColor,
                navNextTxt: settings.navNextTxt,
                navPrevTxt: settings.navPrevTxt,
                showSlideNum: settings.showSlideNum,
                showTotalSlideNum: settings.showTotalSlideNum,
                transition: settings.transition,
                transitionTime: settings.transitionTime,
                slctdBgClr: settings.background,
                timeBetweenSlides: settings.autoSlide,
                randomAutoSlide: settings.randomAutoSlide,
                loopMode: settings.loop,
                shortCuts: settings.keyBoardShortCut
            },
            target: target,
            divId: divId,
            slides:slides,
            totalSlides:totalSlides,
            slideCount: slideCount,
            prevBgColor: prevBgColor,
            activeModes:{
                isSlideMode: true,
                prevSlide: 0,
                isLoopModeActive: false,
                isAutoSlideMode: false,
                isEnbleNextBtn: true,
                isEnblePrevBtn: true
            }
        }

        // Keyboard shortcuts
        if (settings.keyBoardShortCut)
            $(document).bind("keydown",configObj.keyDown);

        configObj.init();

    }
})(jQuery);
