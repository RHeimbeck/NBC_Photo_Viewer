(function(global){

    // Variables global to this module
    var Sources = [
            'http://data.nbcnews.com/drone/getbyid?id=newscms/entry/364286&output=today', // Memorial day
            'http://data.nbcnews.com/drone/getbyid?id=newscms/entry/367081&output=today', // Space
            'http://data.nbcnews.com/drone/getbyid?id=newscms/entry/371361&output=today'  // Tony Awards
        ],
        headline = null,
        summary = null,
        imageList = null,
        activeSet = 0,
        currentImageIdx,
        lastImageIdx;

    //-----------------------------------------------------------------------
    // Initial page set-up. Called once, on Ready.
    $(document).ready(function () {
        loadPhotoSet(0);

        // This is the click handler for the modal dialog controls
        $('.modal-body-label button').on('click', function () {
            var $ele = $(this);
            $ele.blur();
            $ele.hasClass('next')? currentImageIdx++ : currentImageIdx--;
            configModal(currentImageIdx);
            return false;
        });

        // This is the click handler for the image gallery set selectors
        $('.gallerySelector input').on('click', function(){
            var idx = parseInt(this.value);
            if(idx !== activeSet){
                activeSet = idx;
                loadPhotoSet(idx);
            }
        });
    });

    //-----------------------------------------------------------------------
    function loadPhotoSet(setNum){
        var url;

        if(setNum >= 0 && setNum < Sources.length){
            url = Sources[setNum];
        }

        clearImageGallery();

        loadImageSetData( url,
            function(data){
                extractImageData(data);
                buildImageListItems();
                createImageClickHandlers();
        }, function(textStatus, errorThrown){
            // failed to load json file
            if(window.console && window.console.log){
                window.console.log(textStatus + ' ' + errorThrown);
            }
        });
    }

    //-----------------------------------------------------------------------
    function extractImageData(rawData){
        headline = rawData.results[0].cover_Headline;
        summary = rawData.results[0].summary;
        imageList = rawData.results[0].gallery.photos || [];
        lastImageIdx = imageList.length -1;
    }

    //-----------------------------------------------------------------------
    function buildImageListItems(){
        var html = '',
            i,
            len = imageList.length;

        // Set the Headling and Summary content
        $('#headline').text(headline);
        $('#summary').text(summary);

        // Build out the HTML for the list of thumb-images
        for(i = 0; i < len; i++){
            html += "<li class='col-lg-2 col-md-3 col-sm-4 col-xs-6'>";
            html += "<img class='thumbImg' src='" + getAltImageURL(imageList[i].url, 'smw') + "' data-idx='" + i + "' onerror='imageLoadError(this);'></li>"
        }

        $('ul.gallery').html(html);
    }

    //-----------------------------------------------------------------------
    // Utilize the NBC image sizing service to find an alternate size image file
    function getAltImageURL(url, size){
        var ext, altURL;

        switch(size){
            case 'smn': ext = ".nbcnews-fp-320-400.jpg"; // small-narrow
                break;
            case 'smw': ext = ".nbcnews-fp-360-200.jpg"; // small-wide
                break;
            case 'mdn': ext = ".nbcnews-fp-600-320.jpg"; // medium-narrow
                break;
            case 'lgw': ext = ".nbcnews-ux-1024-900.jpg"; // large-narrow
                break;
            default:
                return url; // could not find matching size modifier
        }

        altURL = url.replace("\/i\/", "\/j\/").replace(".jpg", ext);
        return altURL;
    }

    //-----------------------------------------------------------------------
    function createImageClickHandlers() {
        // This is the click handler for the Thumb images
        $('.gallery img').on('click', function () {
            currentImageIdx = $(this).data('idx');
            configModal(currentImageIdx);
            $('#myModal').modal();
            return false;
        });
    }

    //-----------------------------------------------------------------------
    function clearImageGallery(){
        // Remove all image click-handlers when we tear-down the gallery
        $('.gallery img').off('click');

        $('ul.gallery').html('');
    }

    //-----------------------------------------------------------------------
    // Worker function called on the initial creation of the first modal
    // and as a response to the modal "next" and "previous" buttons.
    function configModal(idx){
        var $modalBody = $('.modal-body'),
            $bNext = $modalBody.find('button.next'),
            $bPrev = $modalBody.find('button.previous'),
            $img = $modalBody.find('img'),
            $caption = $modalBody.find('.caption'),
            data;

        // show/hide next button
        if ( idx >= lastImageIdx ) {
            idx = lastImageIdx; // safeguard - should not happen
            $bNext.prop('disabled', true);
        } else {
            $bNext.prop('disabled', false);
        }

        // show/hide previous button
        if (idx <= 0) {
            idx = 0; // safeguard - should not happen
            $bPrev.prop('disabled', true);
        } else {
            $bPrev.prop('disabled', false);
        }

        data = imageList[idx];
        $img.attr('src', getAltImageURL(data.url, 'mdn'));
        $caption.html( data.caption );
    }

    //-----------------------------------------------------------------------
    // Basic jQuery Ajax routine. Note that it expecting jsonp for cross-site calls.
    function loadImageSetData(url, successCb, failCb) {

        $.ajax({
            method: "Get",
            url: url,
            dataType: 'jsonp'
        }).done( function (msg) {
            successCb(msg);
        }).fail( function (jqXHR, textStatus, errorThrown ){
            failCb(textStatus, errorThrown);
        });

        return 1;
    }

})(window);