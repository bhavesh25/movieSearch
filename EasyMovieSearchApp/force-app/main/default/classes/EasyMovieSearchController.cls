public with sharing class EasyMovieSearchController {
    public EasyMovieSearchController() {

    }

    @AuraEnabled
    public static string getMovieDetails(){
        try {
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            //req.setEndpoint('http://www.omdbapi.com/?i=tt3896198&apikey=16eed46f');//original
            //req.setEndpoint('https://run.mocky.io/v3/e51f5219-f2a6-40c8-9e91-7bee0098f0c1');
            req.setEndpoint('https://run.mocky.io/v3/56fa7920-c21c-423a-9d1d-ccd96383040e');
            req.setMethod('GET');
            HttpResponse res = h.send(req);
            return res.getBody();
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string saveMovieDetails(String movieName, String custName, String custPhone, String custEmail, String movieDate, String rating, String feedback){
        System.debug(movieName+' - '+  custName+' - '+  custPhone+' - '+custEmail+' - '+ movieDate+' - '+ rating+' - '+ feedback);
        try {
            Movie_Feedback__c mov = new Movie_Feedback__c();
            mov.Movie_Name__c = movieName;
            mov.Customer_Name__c = custName;
            mov.Customer_Phone__c = custPhone.trim();
            mov.Customer_Email__c = custEmail;
            mov.Movie_Date__c = date.valueof(movieDate);
            mov.Feedback__c = feedback;
            mov.User_Rating__c = Integer.valueOf(rating);
            System.debug(mov);
            insert mov;
            return 'success';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}