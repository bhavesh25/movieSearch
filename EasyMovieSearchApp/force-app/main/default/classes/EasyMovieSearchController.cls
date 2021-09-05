public with sharing class EasyMovieSearchController {
    public EasyMovieSearchController() {

    }
    //Method to hit the api and get the response.
    @AuraEnabled
    public static string getMovieDetails(String title,String page){
        try {
            if(title.indexOf(' ') > -1)
                title = title.replaceAll( ' ', '+');
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('http://www.omdbapi.com/?s='+title+'&apikey=16eed46f&type=movie&page='+page);
            //req.setEndpoint('https://run.mocky.io/v3/56fa7920-c21c-423a-9d1d-ccd96383040e');//for testing purpose.
            //req.setEndpoint('https://run.mocky.io/v3/2b1a22c4-bde4-45a2-8bb6-5264ae7100c2');//empty response.
            req.setMethod('GET');
            HttpResponse res = h.send(req);
            return res.getBody();
            
        } catch (Exception e) { 
            throw new AuraHandledException(e.getMessage());
        }
    }

    //method to save the details
    @AuraEnabled
    public static string saveMovieDetails(String movieName, String custName, String custPhone, String custEmail, String movieDate, String rating, String feedback){
        try {
            Movie_Feedback__c mov = new Movie_Feedback__c();
            mov.Movie_Name__c = movieName;
            mov.Customer_Name__c = custName;
            mov.Customer_Phone__c = custPhone.trim();
            mov.Customer_Email__c = custEmail;
            mov.Movie_Date__c = date.valueof(movieDate);
            mov.Feedback__c = feedback;
            mov.User_Rating__c = Integer.valueOf(rating);
            insert mov;
            return 'success';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}