angular.module('profileApp.profileServices', [])

.service('ProfileServices',["$resource", function($resource){
   return{
       getPersonalDetail : function(){
           return $resource("data/personalDetail.json")
       },
       getProfessionalDetail : function(){
           return $resource("data/professionalDetail.json")
       }
   }
}]);