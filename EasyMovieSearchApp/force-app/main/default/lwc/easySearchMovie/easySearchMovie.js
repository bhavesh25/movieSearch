import { LightningElement, track } from 'lwc';
import searchMoviesApexMethod from '@salesforce/apex/EasyMovieSearchController.getMovieDetails';
import saveMovieDetailsMethod from '@salesforce/apex/EasyMovieSearchController.saveMovieDetails';

export default class EasySearchMovie extends LightningElement {
    //variables for screens
    firstScreen;
    secondScreen;
    thirdScreen;
    fourthScreen;
    //button show hide 
    showNext2;
    showNext3;
    showNext4;
    disableSearchButton;
    disableSubmit;
    showBackLink;
    firstScreenErrorMsg;
    
    //for pagination
    moviesForUI;
    totalCount;
    disablePrev;
    disableNext;
    
    movieSelected;
    searchString;
    showError;
    finalScreen;
    submitDataMsg;
    //user input variables
    custName;
    custEmail;
    custPhone;
    moviedate;
    ratingValue;
    feedback;

    pagetotal;
    page;
    actualPageTotal;
    allMovies;
    pointer;
    apiPage;
    modVal;
    responseTotal;
    
    
    showSpinner;

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
        this.page = 1;
        this.pagetotal = 0;
        this.actualPageTotal = 0;
        this.allMovies = new Array();
        this.pointer = 0;
        this.apiPage = 0;
        this.modVal = 0;
        this.responseTotal = 0;
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

    //calling apex method to hit the api and get response
    searchMovie(){
        this.showSpinner = true;
        this.moviesForUI = new Array();
        this.disableSearchButton = true;
        this.apiPage = this.apiPage + 1;
        searchMoviesApexMethod({title:this.searchString,page:this.apiPage})
                .then((result)=>{
                        let response = JSON.parse(result);
                        if(response.Response === "True"){
                            this.responseTotal = parseInt(response.totalResults);
                            this.modVal = (response.totalResults%9)
                            if(response.totalResults > 9)
                                this.pagetotal = Math.ceil((response.totalResults)/9);
                            else
                                this.pagetotal = 1
                            if(response.totalResults > 10)
                            this.actualPageTotal = Math.ceil((response.totalResults)/10);
                            else
                                this.actualPageTotal = 1;
                            
                            this.allMovies = this.allMovies.concat(response.Search);
                            this.moviesForUI = this.allMovies.slice(this.pointer,this.pointer+9);
                            
                            if(this.apiPage === this.actualPageTotal){
                                this.pointer = this.pointer + this.modVal;
                            } else {
                                this.pointer = this.pointer + 9;
                            }
                            this.headerText = 'Movies list';
                            this.firstScreen = false;
                            this.secondScreen = true;
                            this.showError = false;
                            this.firstScreenErrorMsg = '';
                            this.handleScrollToTop();
                            this.handleButtons();
                        } else{
                            this.showError = true;
                            this.firstScreenErrorMsg = response.Error;
                        }
                        this.showSpinner = false;
                        
                    
                })
                .catch((error)=>{
                    this.showError = true;
                    this.showSpinner = false;
                    this.firstScreenErrorMsg = 'Something went wrong, please try again later.'
                    console.log(error)
                })
        
        
        
        
        
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
        this.page = this.page + 1;
        
        if(this.allMovies.length - this.pointer >= 9 || this.allMovies.length === this.responseTotal){
            this.showSpinner = true;
            this.moviesForUI = [];
            this.moviesForUI = this.allMovies.slice(this.pointer,this.pointer+9);
            if(this.allMovies.length === this.responseTotal && this.modVal > 0 ){
                this.pointer = this.pointer + this.modVal;
            } else {
                this.pointer = this.pointer + 9;
            }
            
            this.showSpinner = false;
            
        } else {
            this.searchMovie();
        }
        this.handleScrollToTop();
        this.handleButtons();
                
        
    };

    //Pagination Prev button function.
    showPrevImages(){
        this.showSpinner = true;
        this.resetNext2Button();
        this.page = this.page -  1;
        if(this.allMovies.length === this.responseTotal && this.modVal > 0){
            this.pointer = this.pointer - this.modVal;
        } else {
            this.pointer = this.pointer - 9;
        }
        this.moviesForUI = [];
        this.moviesForUI = this.allMovies.slice((this.pointer-9),this.pointer);
        
        this.handleButtons();
        
        
        this.handleScrollToTop();
        this.showSpinner = false;
    };

    resetNext2Button(){
        this.movieSelected = '';
        this.showNext2 = false;
    };
    handleButtons(){
        if(this.page > 1){
            this.disablePrev = false;
        } else {
            this.disablePrev = true;
        }
        if(this.page < this.pagetotal){
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
        
    };
    

}