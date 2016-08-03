'use strict';
var zapApp = angular.module('zapApp',['ui.router','ngCookies']);

zapApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
	
	$stateProvider
	
	.state('root',{
          url: '',
          abstract: true,
          views: {
            'footer':{
              templateUrl: 'templates/common/footer.html',
              
            },
			'header':{
              templateUrl: 'templates/common/header.html',
              controller: "headerCtrl"
            }
        }
    })
		
	.state('root.home' ,{
		url: "/",
		views: {
            'container@': {
				templateUrl: "templates/home.html",
            }
        },
		
		resolve:{
			"check":function(accessFac,$location){   
				if(accessFac.checkPermission()){    
			
				}else{
					$location.path('/login');				
				}
			}
		}
	})
	
	.state('root.create_order' ,{
		url: "/create_order",
		views: {
            'container@': {
				templateUrl: "templates/create_order.html",
				controller: "createOrderCtrl"
            }
        },
		
		resolve:{
			"check":function(accessFac,$location){   
				if(accessFac.checkPermission()){    
			
				}else{
					$location.path('/login');				
				}
			}
		}
	})
	
	.state('root.tracking' ,{
		url: "/tracking",
		views: {
            'container@': {
				templateUrl: "templates/tracking.html",
            }
        },
		
		resolve:{
			"check":function(accessFac,$location){   
				if(accessFac.checkPermission()){    
			
				}else{
					$location.path('/login');				
				}
			}
		}
	})
	
	.state('root.history' ,{
		url: "/history",
		views: {
            'container@': {
				templateUrl: "templates/history.html",
            }
        },
		
		resolve:{
			"check":function(accessFac,$location){   
				if(accessFac.checkPermission()){    
			
				}else{
					$location.path('/login');				
				}
			}
		}
	})
	
	.state('404', {
		url: "/404",
        templateUrl: 'templates/404.html',
       
    })
	
	.state('login' ,{
		url: "/login",
		views: {
            'container@': {
				templateUrl: "templates/login.html",
				controller: "loginCtrl",
            }
        },
		
		data : { pageTitle: 'Login' , pageController: "assets/js/alert.js"},
		resolve:{
			"check":function(accessFac,$location){   
				if(accessFac.checkPermission()){    
					$location.path('/');	
				}else{
								
				}
			}
		}
	})
	
	

});

/* --------------------------------------------- Update Title Script -------------------------------------------------------------------------------- */

zapApp.directive('updateTitle', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    return {
      link: function(scope, element) {

        var listener = function(event, toState) {

          var title = 'Default Title';
          if (toState.data && toState.data.pageTitle) title = toState.data.pageTitle;

          $timeout(function() {
            element.text(title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }
]);

zapApp.directive('updateScript', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    return {
      link: function(scope, element) {

        var listener = function(event, toState) {

          var title = 'Default Title';
          if (toState.data && toState.data.pageController) title = toState.data.pageController;

          $timeout(function() {
            element.attr('src',title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }
]);

/* --------------------------------------------- Update Title Script -------------------------------------------------------------------------------- */

/* --------------------------------------------- Check User -------------------------------------------------------------------------------- */

zapApp.factory('accessFac',function($cookieStore){
	var obj = {}
	this.access = false;
	obj.getPermission = function(){    //set the permission to true
		//this.access = true;
	}
	obj.checkPermission = function(){
		if($cookieStore.get('u') != '' && typeof $cookieStore.get('u') != 'undefined' && $cookieStore.get('u')  != null && $cookieStore.get('u')  != 'null'){
			return 1;
		}else{
			return 0;
		}			//returns the users permission level 
	}
	return obj;
});

zapApp.factory('linkFac',function($cookieStore){
	var obj = {}
	obj.senderLink = function(){    //set the permission to true
		var links = [
			  {href: "root.create_order", text: "CREATE ORDER"},
			  {href: "root.tracking", text: "TRACKING"},
			  {href: "root.history", text: "HISTORY"},
		];
		return links;
	}
	obj.courierLink = function(){
		if($cookieStore.get('u') != '' && typeof $cookieStore.get('u') != 'undefined' && $cookieStore.get('u')  != null && $cookieStore.get('u')  != 'null'){
			return 1;
		}else{
			return 0;
		}			
	}
	return obj;
});

/* --------------------------------------------- Check User -------------------------------------------------------------------------------- */

/* --------------------------------------------- Login Controller -------------------------------------------------------------------------------- */

zapApp.controller('loginCtrl',function($scope,accessFac,$stateParams,$http,$cookieStore,$location){
	//alert($stateParams.id);
	$scope.getAccess = function(){
		accessFac.getPermission();       //call the method in acccessFac to allow the user permission.
	}

	 $scope.checkForm = function(){
		 
		   var phone = $('.phone-zap').val();
		   var pass = $('.pass-zap').val();
		   if(phone == '' || pass == ''){
				$(".warning-login p").html('Please in this field');
				$('.warning-login').css('display','block');
				$('.warning-login p').css('opacity',0);
				$(".warning-login p").animate({opacity: "1"});
				 if(pass == ''){
					 $('.pass-zap').focus();
				 }
				 if(phone == ''){
					 $('.phone-zap').focus();
				 }
				 return;
		   }
		   $('.icon-loading-zap').css('display','block');
		   $http({
				method : "POST",
				url : "http://app-dev.zap.delivery:80/api/v1/sender/account/login/",
				data: {
					phone: $scope.user.name,
					password: $scope.user.pass,
				}, 
				dataType: 'json',
			}).then(function mySucces(response) {
				$('.icon-loading-zap').css('display','none');
				$cookieStore.put('u', $scope.user.name+'----'+response.data['token']+'----'+$scope.user.pass);
				$location.path('/');
			}, function myError(response) {
				if(response.data['code'] == 'validation_error'){
					$(".warning-login p").html(response.data['fields']['phone']);
				}
				if(response.data['code'] == 'invalid_credentials'){
					$(".warning-login p").html(response.data['detail']);
				}
				 $('.icon-loading-zap').css('display','none');
				 $('.warning-login').css('display','block');
				 $('.warning-login p').css('opacity',0);
				 $(".warning-login p").animate({opacity: "1"});
				 $('.icon-loading-zap').css('display','none');
			});
	   }
})

/* --------------------------------------------- Login Controller -------------------------------------------------------------------------------- */

/* --------------------------------------------- Header Controller -------------------------------------------------------------------------------- */

zapApp.controller('headerCtrl',function($scope,linkFac){
	$scope.links = linkFac.senderLink();
	$scope.pageNumber = -1;
	$scope.title = 'HOME';
	$scope.addClass  = function(index){
		$scope.pageNumber = index;
		$scope.title = $scope.links[index].text;
	}
	$scope.homeClick  = function(){
		$scope.title = 'HOME';
	}
})

zapApp.controller('createOrderCtrl',function($scope,linkFac,$sce,$cookieStore,$http){
	
	$scope.inputsPickup = [
			  {label: "Sender Name", val: "",placeholder: "Your Name",type: "text"},
			  {label: "Phone Number:", val: "",placeholder: "Your Phone",type: "text"},
			  {label: "Adress Line 1", val: "",placeholder: "Your Adress 1",type: "text"},
			  {label: "Adress Line 2", val: "",placeholder: "Your Adress 2",type: "text"},	
		];
	$scope.inputsDropoff = [
			  {label: "Sender Name", val: "",placeholder: "Your Name",type: "text"},
			  {label: "Phone Number:", val: "",placeholder: "Your Phone",type: "text"},
			  {label: "Adress Line 1", val: "",placeholder: "Your Adress 1",type: "text"},
			  {label: "Adress Line 2", val: "",placeholder: "Your Adress 2",type: "text"},	
		];
	var token = $cookieStore.get('u').split('----');
	$scope.token = token[1];
	
	$http({
		method : "GET",
		url : "http://app-dev.zap.delivery:80/api/v1/sender/account/",
		headers: {"Authorization": 'JWT '+$scope.token},
		dataType: 'json',
	}).then(function mySucces(response) {
		$scope.inputsPickup[0].val = response.data['first_name'] + ' ' + response.data['last_name'];
		$scope.inputsPickup[1].val = response.data['phone'];
	}, function myError(response) {
		
	});
	$scope.titles = [
		{label: "SET PICK-UP LOCATION", content: $scope.inputsPickup,type: "pickup",img: "assets/img/zap/zap-pickup-icon.png"},
		{label: "DROP-OFF LOCATION", content: $scope.inputsDropoff,type: "dropoff",img: "assets/img/zap/zap-dropoff-icon.png"},
	]
	
	
	$scope.packageTypesOne = [
			  {label: "DOCUMENT",content:$sce.trustAsHtml("<p>Size: 10x30x40 cm</p><p>Weight:<= 10kg</p><p>Use this when the weight of your package reaches 10kg</p>"),code: "SGD 5.0"},
			  {label: "PARCEL",content:$sce.trustAsHtml("<p>Size: 10x30x40 cm</p><p>Weight:<= 10kg</p><p>Use this when the weight of your package reaches 10kg</p>"),code: "SGD 6.0"},	
		];
	$scope.packageTypesRet = [
			  {label: "DOCUMENT",content:$sce.trustAsHtml("<p>Size: 10x30x40 cm</p><p>Weight:<= 10kg</p><p>Use this when the weight of your package reaches 10kg</p>"),code: "SGD 5.0"},
			  {label: "PARCEL",content:$sce.trustAsHtml("<p>Size: 10x30x40 cm</p><p>Weight:<= 10kg</p><p>Use this when the weight of your package reaches 10kg</p>"),code: "SGD 6.0"},	
		];
	$scope.packages = [
			  {label:$sce.trustAsHtml("ONE WAY <img src='assets/img/zap/zap-package_icon_while.png' alt/>"),content: $scope.packageTypesOne},
			  {label:$sce.trustAsHtml("RETURN TRIP <img src='assets/img/zap/zap-package_icon_while.png' alt/>"),content: $scope.packageTypesRet},	
		];
	$scope.promoCode = [
			  {input:$sce.trustAsHtml("<input class='zap-promo-input' type='text'/>"),content: $sce.trustAsHtml('<p class="zap-title-type-package">Do you have discount code?</p>'),html: '',aCode: '',info: ''},
		];
	$scope.orderDetalled = [
			  {label: "Order Detalled",val: "Order",placeholder: "Order Detalled",type: "text"},
		];
	$scope.promoCode[0].html = $scope.promoCode[0].content;
	$scope.promoCode[0].aCode = 'APPLY CODE';
	$scope.pageNumber = 0
	$scope.reviewDeliveryType = "ONE WAY";
	$scope.packageType = "DOCUMENTY";
	$scope.reviewDistance = "";
	$scope.reviewSubtotal = "-SGD0.0";
	$scope.reviewDiscount = "-20%";
	$scope.reviewDiscountSGD = "SGD10.0";
	$scope.reviewTotal = "SGD9.7";
	$scope.reviewTotalInfo = "(With GST)";
	$scope.addClassPackage = function(index){
		$scope.pageNumber = index;
		if(index == 0){
			$scope.reviewDeliveryType = "ONE WAY";
		}else{
			$scope.reviewDeliveryType = "RETURN TRIP";
		}		
	}
	$scope.pagepackage = 0;
	$scope.addanimatePackage = function(index){
		$scope.pagepackage = index;
		$scope.packageType = $scope.packages[$scope.pageNumber].content[index].label;
	}
	$scope.applyPromo = function(){
		if($scope.promoCode[0].aCode == 'APPLY CODE'){
			$scope.promoCode[0].html = $scope.promoCode[0].input;
			$scope.promoCode[0].aCode = 'APPLY';
		}else{
			
		}
	}
	
})