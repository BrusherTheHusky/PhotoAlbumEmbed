/*  PhotoAlbumEmbed
    Copyright (C) 2025 Brusher The Husky

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.


    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.


    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>. */

function doGet(p) {
  var webOut = HtmlService.createHtmlOutput();
  webOut.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  var aId = p.parameter.album;
  var nextPageToken = "";
  webOut.append('<html><head><style>\n\
                 @import url(\'https://fonts.googleapis.com/css2?family=Bitter&display=swap\');\n\
                 \n\
                 body {\n\
                   margin: 0px;\n\
                   overflow-x: hidden;\n\
                   font-family: \'Bitter\', sans-serif;\n\
                   text-align: center;\n\
                   font-size: 15px;\n\
                   line-height: 1.6;\n\
                   width: calc(100% + 50px);\n\
                   margin: 0px -25px;\n\
                 }\n\
                 a {\n\
                   cursor: pointer;\n\
                 }\n\
                 .imgWrap {\n\
                   display: inline-block;\n\
                   margin: 0px 25px 50px 25px;\n\
                   width: 230px;\n\
                   vertical-align: top;\n\
                   color: black;\n\
                 }\n\
                 .imgThumb {\n\
                   width: 230px;\n\
                   height: 128px;\n\
                   object-fit: cover;\n\
                   display: block;\n\
                 }\n\
                 .imgCaption {\n\
                   text-decoration: underline;\n\
                 }\n\
                 #viewerClose {\n\
                   position: fixed;\n\
                   top: 0px;\n\
                   left: 0px;\n\
                   height: calc(100vh - 50px);\n\
                   max-height:600px;\n\
                   width: 100vw;\n\
                 }\n\
                 #viewerWindow {\n\
                   display: none;\n\
                   width: 100vw;\n\
                   height: 100vh;\n\
                   z-index: 100;\n\
                   position: fixed;\n\
                   top: 0px;\n\
                   left: 0px;\n\
                   background-color: white;\n\
                 }\n\
                 #viewerImg {\n\
                   width: 100vw;\n\
                   height: calc(100vh - 50px);\n\
                   max-height: 600px;\n\
                   object-fit: contain;\n\
                 }\n\
                 #viewerCaptionBar {\n\
                   width: 100vw;\n\
                   overflow-wrap: anywhere;\n\
                   text-align: left;\n\
                 }\n\
                 #viewerDlLink {\n\
                   display: inline-block;\n\
                   float: right;\n\
                   margin-left: 50px;\n\
                   color: black;\n\
                 }\n\
                 @media all and (max-width: 600px) {\n\
                   .imgWrap {\n\
                     width: calc(100% - 50px);\n\
                     display: block;\n\
                     margin: 0px 25px 25px 25px;\n\
                   }\n\
                   \n\
                   .imgThumb {\n\
                     display: inline-block;\n\
                     width: 200px;\n\
                     height: 110px;\n\
                     vertical-align: top;\n\
                     padding-right: 25px;\n\
                   }\n\
                   .imgCaption {\n\
                     display: inline-block;\n\
                     width: calc(100% - 225px);\n\
                   }\n\
                 }\n\
                 </style></head><body><span style="text-align:left;">');
  Logger.log('Getting content of album '+aId);
  while (nextPageToken !== undefined){
    var aGetOpts = {
      'muteHttpExceptions' : true,
      'method' : 'post',
      'contentType' : 'application/json',
      'headers' : {
        'Authorization' : "Bearer "+ScriptApp.getOAuthToken()  
      },
      'payload' : '{"albumId": "'+aId+'", "pageSize": 50, "pageToken": "'+nextPageToken+'"}'
    };
    var aGet = UrlFetchApp.fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", aGetOpts);
    var aReturned = aGet.getContentText();
    var aResponse = JSON.parse(aReturned);
    for (var i = 0; i < aResponse.mediaItems.length; i++) {
      var aItem = aResponse.mediaItems[i];
      var iUri = aItem.baseUrl;
      if (aItem.description == undefined) {
        var iCaption = "";
      } else {
        var iCaption = aItem.description;
      }
      webOut.append('<a onclick="showPlayWindow(&quot;'+iUri+'&quot;,&quot;'+iCaption+'&quot;)"><div class="imgWrap" id="'+i+'"><img class="imgThumb" src="'+iUri+'=w230-h128-c" alt="'+iCaption+'"/><div class="imgCaption">'+iCaption+'</div></div></a>');
      Logger.log(' - '+iUri);
    };
    Logger.log('End of page '+nextPageToken);
    nextPageToken = aResponse.nextPageToken;
  };
  Logger.log('End of album, returning HTML');
  webOut.append('</span><div id="viewerWindow"><a id="viewerClose" onclick="hidePlayWindow()"></a><img id="viewerImg" />\n\
                 <div id="viewerCaptionBar"><span id="viewerCaption"></span><a target="_blank" id="viewerDlLink">Download image</a></div>\n\</div>\n\
                 <script>\n\
                 function showPlayWindow(iUri, iCaption) {\n\
                   document.getElementById("viewerImg").src = iUri+"=w1200-h600";\n\
                   document.getElementById("viewerImg").alt = iCaption;\n\
                   document.getElementById("viewerCaption").textContent = iCaption;\n\
                   document.getElementById("viewerDlLink").href = iUri+"=d";\n\
                   document.getElementById("viewerWindow").style.display = "block";\n\
                   document.getElementsByTagName("body")[0].style.overflowY = "hidden";\n\
                 }\n\
                 function hidePlayWindow() {\n\
                   document.getElementById("viewerWindow").style.display = "none";\n\
                   document.getElementsByTagName("body")[0].style.overflowY = "visible";\n\
                   document.getElementById("viewerImg").src = "";\n\
                   document.getElementById("viewerImg").alt = "";\n\
                   document.getElementById("viewerCaption").textContent = "";\n\
                   document.getElementById("viewerDlLink").href = "";\n\
                 }\n\
                 </script></body></html>');
  return webOut;
};
