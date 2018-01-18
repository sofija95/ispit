var app = angular.module('myApp', ['ui.bootstrap']);

app.controller('MyCtrl', function($scope, $window, $http, $location, $uibModal) {
    var vm = this;

    vm.svi_stanovi = [];
    vm.stanovi = [];
    vm.stan = null;
    vm.moji_stanovi = [];
    vm.novi_stan = null;
    vm.kreiran = false;

    vm.korisnici = [];
    vm.korisnik = null;

    vm.user = null;

    vm.currentPage = 1;
    vm.itemsPerPage = 9;
    vm.totalItems = 10;
    vm.maxSize = 5;

    vm.sortColumn = 'price';
    vm.sortClass = 'fa-sort-numeric-asc';
    vm.reverse = false;

    $scope.alerts = [
    ];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    vm.contact = {};

    vm.login = function () {
        if (vm.autorizovan) {
            $window.location.href = "home.html";
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'register.html',
            size: 'lg',
            windowClass: 'register-modal',
            controller: function($uibModalInstance, parent){
                var $ctrl = this;
                $ctrl.action = 'login';

                $ctrl.alerts = [];
                $ctrl.login = function () {
                    for (var i in vm.korisnici) {
                        var korisnik = vm.korisnici[i];
                        if ($ctrl.username == korisnik.username && $ctrl.password == korisnik.password) {
                            vm.autorizovan = true;
                            $window.localStorage.setItem('user',  JSON.stringify(korisnik));
                            $uibModalInstance.close(korisnik);
                            return;
                        }
                    }
                    $ctrl.alerts.push({ type: 'danger', msg: 'Korisnicko ime ili sifra nisu validni' } );
                };

                $ctrl.register = function () {
                    for (var i in vm.korisnici) {
                        var korisnik = vm.korisnici[i];
                        if ($ctrl.email == korisnik.email) {
                            $ctrl.alerts.push({ type: 'danger', msg: 'Korisnicko vec postoji' } );
                            console.log($ctrl.alerts);
                            return;
                        }
                    }
                    if($ctrl.password != $ctrl.password1){
                        $ctrl.alerts.push({ type: 'danger', msg: 'Sifre nisu iste' } );
                        console.log($ctrl.alerts);
                        return;
                    }
                    var user = {
                        user_id : vm.korisnici.length + 1,
                        email: $ctrl.email,
                        username: $ctrl.email,
                        password: $ctrl.password,
                        first_name: $ctrl.first_name,
                        last_name: $ctrl.last_name,
                        agency: null,
                        address:null
                    };
                    console.log(user);
                    vm.autorizovan = true;
                    $window.localStorage.setItem('user',  JSON.stringify(user));
                    vm.korisnici.push(user);
                    $uibModalInstance.close(user);
                };

                $ctrl.odustani = function () {
                    $uibModalInstance.dismiss('odustani');
                };

                $ctrl.closeAlert = function(index) {
                    $ctrl.alerts.splice(index, 1);
                };
            },
            controllerAs: '$ctrl',
            resolve: {
                parent: function () {
                    return vm;
                }
            }
        });

        modalInstance.result.then(function (korisnik) {
            vm.autorizovan = true;
            vm.user = korisnik;
        }, function () {
            console.log('modal-component dismissed at: ' + new Date());
        });
    };

    vm.izmeniKorisnika = function (el) {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'user-profile.html',
            size: 'lg',
            windowClass: 'korisnik-modal',
            controller: function($uibModalInstance, korisnik){
                var $ctrl = this;

                $ctrl.korisnik = angular.copy(korisnik);

                $ctrl.alerts = [];

                $ctrl.closeAlert = function(index) {
                    $ctrl.alerts.splice(index, 1);
                };

                $ctrl.izmeni = function() {
                    for (var i in vm.korisnici) {
                        var _korisnik = vm.korisnici[i];
                        if ($ctrl.korisnik.user_id != _korisnik.user_id && $ctrl.korisnik.email == _korisnik.email) {
                            $ctrl.alerts.push({ type: 'danger', msg: 'Korisnicko vec postoji' } );
                            console.log($ctrl.alerts);
                            return;
                        }
                    }
                    if($ctrl.korisnik.password != $ctrl.korisnik.password1){
                        $ctrl.alerts.push({ type: 'danger', msg: 'Sifre nisu iste' } );
                        console.log($ctrl.alerts);
                        return;
                    }

                    korisnik.username = $ctrl.korisnik.hasOwnProperty('username') ? $ctrl.korisnik.username : null;
                    korisnik.email = $ctrl.korisnik.hasOwnProperty('email') ? $ctrl.korisnik.email : null;
                    korisnik.password = $ctrl.korisnik.hasOwnProperty('password') ? $ctrl.korisnik.password : null;
                    korisnik.first_name = $ctrl.korisnik.hasOwnProperty('first_name') ? $ctrl.korisnik.first_name : null;
                    korisnik.last_name = $ctrl.korisnik.hasOwnProperty('last_name') ? $ctrl.korisnik.last_name : null;
                    korisnik.agency = $ctrl.korisnik.hasOwnProperty('agency') ? $ctrl.korisnik.agency : null;
                    korisnik.phone = $ctrl.korisnik.hasOwnProperty('phone') ? $ctrl.korisnik.phone : null;
                    korisnik.address = $ctrl.korisnik.hasOwnProperty('address') ? $ctrl.korisnik.address : null;

                    $window.localStorage.setItem('user',  JSON.stringify(korisnik));
                    $uibModalInstance.close();
                };

                $ctrl.odustani = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            controllerAs: '$ctrl',
            resolve: {
                korisnik: function () {
                    return el;
                }
            }
        });

        modalInstance.result.then(function () {
        }, function () {
            console.log('modal-component dismissed at: ' + new Date());
        });
    };

    vm.orderByColumn = function() {
        console.log(vm.reverse);
        if (vm.reverse) {
            vm.reverse = false;
            vm.sortClass = 'fa-sort-numeric-asc';
        } else {
            vm.sortClass = 'fa-sort-numeric-desc';
            vm.reverse = true;
        }
    };
    vm.removeProperty = function (item) {
        if (confirm('Da li ste sigurni')) {
            var index = vm.stanovi.indexOf(item);
            vm.stanovi.splice(index, 1);
        }

    };

    vm.search = function () {
        if(vm.city == undefined && vm.status == undefined && vm.bedrooms == undefined && vm.bathrooms == undefined && vm.minPrice == undefined && vm.maxPrice == undefined && vm.searchText == undefined){
        vm.init();
            return;
            
        }
        
        var list = [];
        var tmp_list = [];
        if(vm.city != undefined){
            for(var i in vm.svi_stanovi){
            var stan = vm.svi_stanovi[i];
            if(vm.city == stan.address.city){
                list.push(stan);
            }
            }
        }else{
            list = vm.svi_stanovi;
        }
        
        if(vm.status != undefined){
            for(var i in list){
            var stan = list[i];
            if(vm.status == stan.details.status){
                tmp_list.push(stan);
            }
            }
            list = tmp_list;
            tmp_list = [];
        }
        if(vm.bedrooms != undefined){
              for(var i in list){
            var stan = list[i];
            if(vm.bedrooms == stan.details.bedrooms){
                tmp_list.push(stan);
            }
            }
            list = tmp_list;
            tmp_list = [];
        }
         if(vm.bathroms != undefined){
              for(var i in list){
            var stan = list[i];
            if(vm.bathroms == stan.details.bathroms){
                tmp_list.push(stan);
            }
            }
            list = tmp_list;
            tmp_list = [];
        }
        
      if(vm.minPrice != undefined){
              for(var i in list){
            var stan = list[i];
            if(stan.price >= vm.minPrice){
                tmp_list.push(stan);
            }
            }
            list = tmp_list;
            tmp_list = [];
        }
         if(vm.maxPrice != undefined){
              for(var i in list){
            var stan = list[i];
            if(stan.price <= vm.maxPrice){
                tmp_list.push(stan);
            }
            }
            list = tmp_list;
            tmp_list = [];
        }
        if(vm.searchText != undefined){
         for(var i in list){
            var stan = list[i];
            if(stan.title.toLowerCase().indexOf(vm.searchText.toLowerCase())!=-1){
                        tmp_list.push(stan);

            }
            }
            
            list = tmp_list;
            tmp_list = []; 
        }
        
        vm.stanovi = list;
        vm.totalItems = list.length;
        
    }

    vm.reset = function () {
        vm.city = null;
        vm.status = null;
        vm.text = null;
        vm.minPrice = null;
        vm.maxPrice = null;
        vm.car_garages = null;

        vm.init();
    }
    
    vm.orderByPrice = function() {
       var list =  vm.stanovi.sort(vm.compare);
        console.log(list);
    }
    
     vm.favorite = function(el){
        if (!vm.autorizovan) {
            $scope.alerts.push({ type: 'danger', msg: 'Morate da budete ulogovani' } );
            return;
        }
        el.favorite = !el.favorite;
        if(el.favorite == true){
            $scope.alerts.push({ type: 'success', msg: 'Film prebacen u grupu omiljenih' } )
        }else {
            $scope.alerts.push({ type: 'danger', msg: 'Film vise nije omiljen' } )
        }
     };

    vm.logout = function () {
        vm.autorizovan = false;
        $window.localStorage.removeItem('user');

    };

    vm.getPropertImage = function (el) {
        var index = vm.stanovi.indexOf(el) + 1;
        if (index > 6) {
            index = index % 6 + 1;
        }
        return 'assets/img/demo/property-' + index + '.jpg';
    };

    vm.kreirajSatn = function () {
        if (!vm.autorizovan) {
            $window.location.href = "register.html";
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'propertyModal.html',
            size: 'lg',
            windowClass: 'property-modal',
            controller: function($uibModalInstance, parent){
                var $ctrl = this;

                $ctrl.username = parent.username;

                $ctrl.snimi = function () {
                    var stan = {
                        "details": {},
                        "additional_details": {},
                        "address":{}
                    };
                    stan.user_id = vm.user.user_id;
                    stan.title = $ctrl.novi_stan.hasOwnProperty('title') ? $ctrl.novi_stan.title : null;
                    stan.price = $ctrl.novi_stan.hasOwnProperty('price') ? parseInt($ctrl.novi_stan.price) : null;
                    stan.description = $ctrl.novi_stan.hasOwnProperty('description') ? $ctrl.novi_stan.description : null;
                    stan.address.city = $ctrl.novi_stan.hasOwnProperty('address') && $ctrl.novi_stan.address.hasOwnProperty('city') ? $ctrl.novi_stan.address.city : null;
                    stan.details.status = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('status') ? $ctrl.novi_stan.details.status : null;
                    stan.details.area = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('area') ? $ctrl.novi_stan.details.area : null;
                    stan.details.bedrooms = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('bedrooms') ? $ctrl.novi_stan.details.bedrooms : null;
                    stan.details.bathrooms = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('bathrooms') ? $ctrl.novi_stan.details.bathrooms : null;
                    stan.details.car_garages = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('car_garages') ? $ctrl.novi_stan.details.car_garages : null;
                    stan.details.garages = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('garages') ? $ctrl.novi_stan.details.garages : null;
                    stan.details.shawers = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('shawers') ? $ctrl.novi_stan.details.shawers : null;

                    vm.stanovi.push(stan);
                    $uibModalInstance.close();
                };

                $ctrl.odustani = function () {
                    $uibModalInstance.dismiss('odustani');
                };
            },
            controllerAs: '$ctrl',
            resolve: {
                parent: function () {
                    return vm;
                }
            }
        });

        modalInstance.result.then(function () {
        }, function () {
            console.log('modal-component dismissed at: ' + new Date());
        });
    };

    vm.izmeniStan = function(el){
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'propertyModal.html',
            size: 'lg',
            windowClass: 'property-modal',
            controller: function($uibModalInstance, novi_stan){
                var $ctrl = this;
                $ctrl.novi_stan = angular.copy(novi_stan);

                $ctrl.snimi = function(){
                    novi_stan.title = $ctrl.novi_stan.hasOwnProperty('title') ? $ctrl.novi_stan.title : null;
                    novi_stan.price = $ctrl.novi_stan.hasOwnProperty('price') ? parseInt($ctrl.novi_stan.price) : null;
                    novi_stan.description = $ctrl.novi_stan.hasOwnProperty('description') ? $ctrl.novi_stan.description : null;
                    novi_stan.address.city = $ctrl.novi_stan.hasOwnProperty('address') && $ctrl.novi_stan.address.hasOwnProperty('city') ? $ctrl.novi_stan.address.city : null;
                    novi_stan.details.status = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('status') ? $ctrl.novi_stan.details.status : null;
                    novi_stan.details.area = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('area') ? $ctrl.novi_stan.details.area : null;
                    novi_stan.details.bedrooms = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('bedrooms') ? $ctrl.novi_stan.details.bedrooms : null;
                    novi_stan.details.bathrooms = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('bathrooms') ? $ctrl.novi_stan.details.bathrooms : null;
                    novi_stan.details.car_garages = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('car_garages') ? $ctrl.novi_stan.details.car_garages : null;
                    novi_stan.details.garages = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('garages') ? $ctrl.novi_stan.details.garages : null;
                    novi_stan.details.shawers = $ctrl.novi_stan.hasOwnProperty('details') && $ctrl.novi_stan.details.hasOwnProperty('shawers') ? $ctrl.novi_stan.details.shawers : null;
                    $uibModalInstance.close();
                }

                $ctrl.odustani = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            controllerAs: '$ctrl',
            resolve: {
                novi_stan: function () {
                    return el;
                }
            }
        });

        modalInstance.result.then(function () {
        }, function () {
            console.log('modal-component dismissed at: ' + new Date());
        });
    };

    vm.vratiStan = function(property_id) {
        if (property_id == null || property_id == undefined) {
            return null;
        }

        var stan = null;
        for (var i in vm.svi_stanovi) {
            if (vm.svi_stanovi[i].property_id == property_id) {
                stan = vm.svi_stanovi[i];
                break;
            }
        }
        return stan;
    };

    vm.vratiKorisnika = function(user_id) {
        if (user_id == null || user_id == undefined) {
            return null;
        }

        var korisnik = null;
        for (var i in vm.korisnici) {
            if (vm.korisnici[i].user_id == user_id) {
                korisnik = vm.korisnici[i];
                break;
            }
        }
        return korisnik;
    };

    vm.vratiStatus = function(status) {
        switch (status) {
            case 'sale':
                return 'For Sale';
            case 'rent':
                return 'For Rent';
            default:
                return 'Undefined';
        }
    };

    vm.posaliMail = function () {
        if (!vm.contact.hasOwnProperty('email') || vm.contact.email == undefined) {
            $scope.alerts.push({ type: 'danger', msg: 'Email je prazan ili nije validan.' });
            return;
        }
        $scope.alerts.push({ type: 'success', msg: 'Hvala sto ste nas kontaktirali.' } )
    };

    vm.init = function () {
        var url = $location.$$absUrl;

        var captured = /property_id=([^&]+)/.exec(url);
        var property_id = captured !== null ? captured[1] : null;

        var my_properites = /user-properties.html/.exec(url);

        vm.user = $window.localStorage.getItem('user');
        if(vm.user != undefined){
            vm.user = JSON.parse(vm.user);
            vm.autorizovan = true;
        }else{
            vm.autorizovan = false;
        }

        var req1 = {
            method: "GET",
            //url: "http://88.99.171.79:8080/filmovi?search="+vm.searchText
            url: "users.json"
        }
        $http(req1).then(
            function(resp){
                vm.korisnici = resp.data.users;
            }, function(resp){
                vm.message = 'error';
            });

        var req = {
            method: "GET",
            //url: "http://88.99.171.79:8080/filmovi?search="+vm.searchText
            url: "properites.json"
        }
        $http(req).then(
            function(resp){
                vm.svi_stanovi = resp.data.properties;
                if (vm.user != null && my_properites != null) {
                    var list = [];
                    for (var i in vm.svi_stanovi) {
                        if (vm.svi_stanovi[i].user_id == vm.user.user_id ) {
                            list.push(vm.svi_stanovi[i]);
                        }
                    }
                }
                vm.stanovi = list != undefined ? list : vm.svi_stanovi;

                vm.totalItems = vm.stanovi.length;

                vm.stan = vm.vratiStan(property_id);
                if (vm.stan != null && vm.stan.hasOwnProperty('user_id')) {
                    vm.korisnik = vm.vratiKorisnika(vm.stan.user_id);
                }
            }, function(resp){
                vm.message = 'error';
            });
    };

    vm.init();
});