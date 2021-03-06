var app=angular.module('homeApp', []);
var count =0;

app.controller('homeController',function($scope,$http) {
    $scope.date = new Date();
    console.log('isUserEnabled'+count); 
    count++;
    setInterval(function(){
        $http({
            method : "GET",
            url : "/fetchInfoForHomePage"
        }).success(function(data){
            $scope.data=data;

        })
    }, 5000);



    $scope.navigateToNova=function() {
        window.location.assign("/nova");
    };

    $scope.navigateToNeutron=function() {
        window.location.assign("/neutron");
    };

    $scope.navigateToMaps=function() {
        window.location.assign("/ip");
    };

    $scope.navigateToCinder=function() {
        window.location.assign("/cinder");
    };

    if(count<2) {
        $http({
            method: "GET",
            url: "/fetchInfoForHomePage"
        }).success(function (data) {
            $scope.data = data;
            $scope.date = new Date();
            var realTimeData = data.volumes;
            var arrayLength = realTimeData.length;
            var categoryLabels = [];
            var categoryCount = [];
            for (var i = 0; i < arrayLength; i++) {
                categoryLabels.push(realTimeData[i]["Volume"]);
                categoryCount.push(realTimeData[i]["count"]);
            }

            var floatingIpData = data.floatingPoints;
            var floatingIpArrayLength = floatingIpData.length;
            var floatingLabels = [];
            var floatingCount = [];
            for (var j = 0; j < floatingIpArrayLength; j++) {
                floatingLabels.push(floatingIpData[j]["FloatingPoints"]);
                floatingCount.push(floatingIpData[j]["count"]);
            }

            var securityData = data.securityGroup;
            var securityArrayLength = securityData.length;
            var securityLabels = [];
            var securityCount = [];
            for (var k = 0; k < securityArrayLength; k++) {
                securityLabels.push(securityData[k]["securityGroup"]);
                securityCount.push(securityData[k]["count"]);
            }
            var instanceData = data.instance;
            var instanceArrayLength = instanceData.length;
            var instanceLabels = [];
            var instanceCount = [];
            for (var l = 0; l < instanceArrayLength; l++) {
                instanceLabels.push(instanceData[l]["instanceList"]);
                instanceCount.push(instanceData[l]["count"]);
            }
            var ramData = data.ram;
            //  alert(ramData.length)
            var ramArrayLength = ramData.length;
            var ramLabels = [];
            var ramCount = [];
            for (var m = 0; m < ramArrayLength; m++) {
                ramLabels.push(ramData[m]["ram"]);
                ramCount.push(ramData[m]["count"]);
            }
            var cpuData = data.cpu;
            var cpuArrayLength = cpuData.length;
            var cpuLabels = [];
            var cpuCount = [];
            for (var n = 0; n < cpuArrayLength; n++) {
                cpuLabels.push(cpuData[n]["cpu"]);
                cpuCount.push(cpuData[n]["count"]);
            }
            var ctx6 = document.getElementById("donutChart6");
            var myDoughnutChart6 = new Chart(ctx6, {
                type: 'doughnut',
                data: {
                    labels: cpuLabels,
                    datasets: [
                        {
                            data: cpuCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });


            var ctx5 = document.getElementById("donutChart5");
            var myDoughnutChart5 = new Chart(ctx5, {
                type: 'doughnut',
                data: {
                    labels: ramLabels,
                    datasets: [
                        {
                            data: ramCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });

            var ctx4 = document.getElementById("donutChart4");
            var myDoughnutChart4 = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: instanceLabels,
                    datasets: [
                        {
                            data: instanceCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });

            var ctx3 = document.getElementById("donutChart3");
            var myDoughnutChart1 = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: securityLabels,
                    datasets: [
                        {
                            data: securityCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });


            var ctx = document.getElementById("donutChart");
            var myDoughnutChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoryLabels,
                    datasets: [
                        {
                            data: categoryCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });

            var ctx1 = document.getElementById("donutChart1");
            var myDoughnutChart2 = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: floatingLabels,
                    datasets: [
                        {
                            data: floatingCount,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#CD5C5C",
                                "#F08080",
                                "#FA8072",
                                "#E9967A",
                                "#FFA07A",
                                "#00FF00",
                                "#800080",
                                "#000080",
                                "#008080",
                                "#FF0000"
                            ]
                        }]
                }
            });

        }), function () {             }
    }
});