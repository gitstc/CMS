var WebService = {
    getURL: function(api) {
        return apiURL + api;
    },
    POST: function(api, data, successCB, errorCB, completeCB) {
        
        data = data || {};
        data.Random = Date.now();
        
        Utils.getServerURL(function(url){
            $.ajax({
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                url: WebService.getURL(api),
                success: successCB,
                error: errorCB,
                complete: completeCB
            });
        });
    },
    GET: function(api, data, successCB, errorCB, completeCB) {
        
        data = data || {};
        data.Random = Date.now();
        
        Utils.getServerURL(function(url){
            $.ajax({
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                data: data,
                url: WebService.getURL(api),
                success: successCB,
                error: errorCB,
                complete: completeCB
            });
        });
        
    },
    GET_EXTERNAL: function(api, data, successCB, errorCB, completeCB) {
        
        data = data || {};
        data.Random = Date.now();
        
        $.ajax({
            type: "GET",
            dataType: "jsonp",
            contentType: "application/json",
            data: data,
            url: api,
            success: successCB,
            error: errorCB,
            complete: completeCB
        });
        
    }
}