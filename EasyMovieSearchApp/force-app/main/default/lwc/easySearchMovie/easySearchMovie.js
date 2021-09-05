import { LightningElement, track } from 'lwc';
import searchMoviesApexMethod from '@salesforce/apex/EasyMovieSearchController.getMovieDetails';
import saveMovieDetailsMethod from '@salesforce/apex/EasyMovieSearchController.saveMovieDetails';

export default class EasySearchMovie extends LightningElement {
    //variables for screens
    @track firstScreen;
    @track secondScreen;
    @track thirdScreen;
    @track fourthScreen;
    //button show hide 
    @track showNext2;
    @track showNext3;
    @track showNext4;
    @track disableSearchButton;
    @track disableSubmit;
    @track showBackLink;
    @track firstScreenErrorMsg;
    
    //for pagination
    matchedMovies;
    @track moviesForUI;
    currentCount;
    totalCount;
    @track disablePrev;
    @track disableNext;
    
    movieSelected;
    searchString;
    @track showError;
    @track finalScreen;
    @track submitDataMsg;
    //user input variables
    custName;
    custEmail;
    custPhone;
    moviedate;
    apiResponse;
    ratingValue;
    feedback;
    
    @track showSpinner;

    connectedCallback(){
        this.resetInitialValues();
        
    };
    renderedCallback(){
        if(this.firstScreen || this.finalScreen){
            this.showBackLink = false;
        } else{
            this.showBackLink = true;
        }
    }


    //setting parameter values
    resetInitialValues(){
        this.searchString = '';
        this.firstScreen = true;
        this.secondScreen = false;
        this.fourthScreen = false;
        this.thirdScreen = false;
        this.disableSearchButton = true;
        this.showNext2 = false;
        this.showNext3 = false;
        this.showNext4 = false;
        this.headerText = 'Search movie';
        this.disableSubmit = false;
        this.finalScreen = false;
        this.submitDataMsg = '';
        this.ratingValue = 5;
        this.showBackLink = false;
        this.showError = false;
        this.firstScreenErrorMsg = '';
        this.apiResponse = [];
    }

    //this method validate the search string, 
    //if blank then button will be disabled and search string length should be more than 3
    validateSearchString(event){
        try{
            this.showError = false;
            this.firstScreenErrorMsg = '';
            this.searchString = event.target.value;
            //check if searchString is not undefined and atleast 3 chars are there in the string.
            if(this.searchString && this.searchString.length > 2){
                this.disableSearchButton = false;
            } else {
                this.disableSearchButton = true;
            }
        } catch(err){
            
        }
        
    };

    //calling apex method to hit the api and get response, if response is already present then skip the api call.
    searchMovie(){
        this.showSpinner = true;
        this.disableSearchButton = true;
        //if api is called once, then response is already saved in the js.
        //no need to call the api again.
        if(this.apiResponse && this.apiResponse.length>0){
            this.searchKeywordFromMovies();
            this.showSpinner = false;
        } else {
            searchMoviesApexMethod()
          .then((result)=>{
            
            if(result){
                
                if(JSON.parse(result).length )
                    this.apiResponse = JSON.parse(result);
                else    
                    this.apiResponse.push(JSON.parse(result));
                
                console.log('api:'+this.apiResponse);
                this.searchKeywordFromMovies();
                this.showSpinner = false;
            } else {
                this.showError = true;
                this.firstScreenErrorMsg = 'No movie found.'
                this.showSpinner = false;
            }
          })
          .catch((error)=>{
            this.showError = true;
            this.showSpinner = false;
            this.firstScreenErrorMsg = 'Something went wrong, please try again later.'
            console.log(error)
          })
        }
        
        
    };

    //reusabel method to find movies from the response using keyword
    searchKeywordFromMovies(){
        this.matchedMovies = [];
        for(var i=0; i<this.apiResponse.length; i++) {
            for(let key in this.apiResponse[i]) {
                if(Array.isArray(this.apiResponse[i][key])){
                    for(var j=0; j<this.apiResponse[i][key].length; j++) {
                        for(let key1 in this.apiResponse[i][key][j]){
                            if(this.apiResponse[i][key][j][key1].toLowerCase().indexOf(this.searchString.toLowerCase())!=-1) {
                                this.matchedMovies.push(this.apiResponse[i]);
                                break;
                            }
                        }
                    }
                }
                else if(this.apiResponse[i][key].toLowerCase().indexOf(this.searchString.toLowerCase())!=-1) {
                    this.matchedMovies.push(this.apiResponse[i]);
                    break;
                }
            }
        }
        //Handling 3X3 grid view
        if(this.matchedMovies.length > 0){
            this.totalCount = this.matchedMovies.length;
            if(this.totalCount > 9){
                this.moviesForUI = this.matchedMovies.slice(0,9);
                this.currentCount = 9;
                this.disablePrev = true;
                this.disableNext = false;
                
            } else {
                this.moviesForUI = this.matchedMovies;
                this.disablePrev = true;
                this.disableNext = true;
            }
            this.headerText = 'Movies list';
            this.firstScreen = false;
            this.secondScreen = true;
            this.showError = false;
            this.firstScreenErrorMsg = '';
            this.handleScrollToTop();
            
        } else {
            this.showError = true;
            this.firstScreenErrorMsg = 'No movie found.'
        }
    };

    //called when movie is selected via radio button
    movieSelectEvent(event){
        this.movieSelected = event.target.dataset.value;
        if(this.movieSelected)
            this.showNext2 = true;
        else 
            this.showNext2 = false;
    };

    //method to show third screen to collect customer data
    showThirdScreen(){
        this.secondScreen = false;
        this.thirdScreen = true;
        this.headerText = 'Customer details';
        this.handleScrollToTop();
        
        
    };

    //method to check all input fields are filled
    validateUserInfo(){
        let isValid = true;
        let username = this.template.querySelector(`[data-id="username"]`);
        let useremail = this.template.querySelector(`[data-id="useremail"]`);
        let userphone = this.template.querySelector(`[data-id="userphone"]`);
        let moviedate = this.template.querySelector(`[data-id="moviedate"]`);

        //check all the input validity, if value populated into all the fields then enable the next button
        isValid = username.checkValidity();
        if(isValid)
            isValid = useremail.checkValidity();
        if(isValid)
            isValid = userphone.checkValidity();
        if(isValid)
            isValid = moviedate.checkValidity();

        if(isValid){
            this.showNext3 = true;
            this.custName = username.value;
            this.custEmail = useremail.value;
            this.custPhone = userphone.value;
            this.moviedate = moviedate.value;
        } else {
            this.showNext3 = false;
        }
    };

    //method to display feedback screen
    showFourthScreen(){
        this.thirdScreen = false;
        this.fourthScreen = true;
        this.headerText = 'Feedback';
        this.handleScrollToTop();
    };

    //method called when rating is changed
    updateRating(event){
        this.ratingValue = event.target.value;
        this.validateFeedbackpage();
    };

    //method to set feedback value
    updateFeedback(event){
        this.feedback = event.target.value;
        this.validateFeedbackpage();
    };

    //validate feedback page input field values
    validateFeedbackpage(){
        let isValid = true;
        let rating = this.template.querySelector(`[data-id="rating"]`);
        let feedback = this.template.querySelector('lightning-input-rich-text');
        if(!rating.value){
            isValid = false;
        }
        if(isValid){
            if(!feedback.value || feedback.value.length==0)
                isValid = false;
        }
            
        if(isValid){
            this.showNext4 = true;
        } else {
            this.showNext4 = false;
        }
    };

    //method to create movie feedback record.
    submitData(){
        this.showSpinner = true;
        saveMovieDetailsMethod({movieName:this.movieSelected,custName:this.custName, custPhone:this.custPhone, custEmail:this.custEmail, movieDate:this.moviedate, rating:this.ratingValue, feedback:this.feedback})
          .then((result)=>{
            this.submitDataMsg = 'Ticket booked successfully.';
            this.finalScreen = true;
            this.fourthScreen = false;
            this.headerText = 'Success';
            this.handleScrollToTop();
            this.showSpinner = false;
          })
          .catch((error)=>{
            console.log(error);
            this.submitDataMsg = 'Error: error while processing the request, please try again later.';
            this.finalScreen = true;
            this.fourthScreen = false;
            this.headerText = 'Error';
            this.handleScrollToTop();
          })

    };

    //method to return the screen to the first page 
    resetValues(){
        this.resetInitialValues();
        this.finalScreen = false;
        this.firstScreen = true;
        this.handleScrollToTop();
    };

    //method called when enter is hit after enter text in the first screen.
    onkeyupMethod(event){
        if(event.which ===13 && this.firstScreen){
            this.searchMovie();
        }
    };

    //method to move the focus on the top of the page.
    handleScrollToTop(){
        const topDiv = this.template.querySelector('[data-id="header"]');
        topDiv.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    };

    //Pagination Next button function.
    showNextImages(){
        this.resetNext2Button();
        
        if(this.totalCount > this.currentCount+9){
                
                this.moviesForUI = this.matchedMovies.slice(this.currentCount,this.currentCount+9);
                this.currentCount = this.currentCount+9;
                
        } else {
            this.moviesForUI = this.matchedMovies.slice(this.currentCount,this.totalCount);
            this.currentCount = this.totalCount;
        }
        this.showHideImageButtons();
        this.handleScrollToTop();
    };

    //Pagination Prev button function.
    showPrevImages(){
        this.resetNext2Button();
        if(this.currentCount === this.totalCount){
            if(this.currentCount % 9 === 0){
                this.currentCount = this.currentCount - 9;
            } else {
                this.currentCount = this.currentCount- (this.currentCount % 9);
            }

            this.moviesForUI = this.matchedMovies.slice(this.currentCount-9,this.currentCount );
        }
        else {
            this.currentCount = this.currentCount-9;
            this.moviesForUI = this.matchedMovies.slice(this.currentCount-9,this.currentCount );
        } 
        this.showHideImageButtons();
        this.handleScrollToTop();
    };

    resetNext2Button(){
        this.movieSelected = '';
        this.showNext2 = false;
    };

    //check when to enable or disable the 
    showHideImageButtons(){
        if(this.currentCount-9 > 0){
            this.disablePrev = false;
        } else {
            this.disablePrev = true;
        }
        if(this.currentCount < this.totalCount){
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
    }

}