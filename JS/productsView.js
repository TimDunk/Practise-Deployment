class ProductListView{
    constructor(list){
        this.productListContainer=list;
        this.resultProductList=structuredClone(list.productArray);
        this.renderList; 
        this.currentPage=1;
        this.previousPage=1;
        this.pageSize=6;
        this.totalPages=Math.ceil(this.resultProductList.length/this.pageSize);
        this.filterConditionsMap=new Map();  //for the filter features
    }

    renderProductsList(pageIndex=1){
        if(this.resultProductList.length==0){
            this.clearPage();  //there is no items to display after filtering,so need to clear the product list
            return true;
        }
            
        if(pageIndex<=0||pageIndex>this.totalPages) //to avoid trying to access non-existing page.
            return false;

        let renderNode=document.getElementById("product_list");
        let productTemplate=document.getElementById("productTemplate");
        this.setRenderList(pageIndex); //because the product list is possibly displyed by several pages
        this.clearPage();
        let listSize=this.renderList.length;
        for(let i=0;i<listSize;i++){
            let clone=document.importNode(productTemplate.content,true);
            clone.querySelector(".name").textContent=this.renderList[i].name;
            let imgSrc=`./images/products/${this.renderList[i].image}`;
            clone.querySelector(".card img").setAttribute("src",imgSrc);
            clone.querySelector(".size").childNodes[1].nodeValue=this.renderList[i].size;
            clone.querySelector(".price").childNodes[1].nodeValue=this.renderList[i].price;
            renderNode.append(clone);
        }
        return true;
    }

    setRenderList(pageIndex){
        let startIndex=(pageIndex-1)* this.pageSize;
        let endIndex= Math.min(pageIndex* this.pageSize,this.resultProductList.length);
        this.renderList=this.resultProductList.slice(startIndex,endIndex)
    }

    //Switch pages features
    switchPage(event){
        let targetElement=event.target.closest(".page-link");
        if(!targetElement.classList.contains("page-link"))
            return;
        console.log("preventDefault.");
        event.preventDefault();

        let targetPageStr=targetElement.dataset.navPage;
        if(isNaN(targetPageStr)){
            if(targetPageStr=="pre"){
                console.log("pre clicked.");
                this.gotoPreviousPage();
            }else{
                this.gotoNextPage();
            }
        }
        else{
            let targetPage=parseInt(targetPageStr);
            let result=this.renderProductsList(targetPage);
            if(result){
                this.previousPage=this.currentPage;
                this.currentPage=targetPage;
                this.switchActiveStatus(targetPage);
            }
                
        }
        
    }

    clearPage(){
        let renderNode=document.getElementById("product_list");
        while (renderNode.firstChild) {
            console.log("clearPage")
            renderNode.removeChild(renderNode.firstChild);
        }
    }

    hasPreviousPage(){
        return this.currentPage>1?true:false;
    }

    hasNextPage(){
        return this.currentPage<this.totalPages?true:false;
    }

    gotoNextPage(){
        if(!this.hasNextPage())
            return;
        let targetPage=this.currentPage+1;
        let result=this.renderProductsList(targetPage);
        if(result){
            this.previousPage=this.currentPage;
            this.currentPage=targetPage;
            this.switchActiveStatus(targetPage);
        }
    }

    gotoPreviousPage(){
        if(!this.hasPreviousPage())
            return;
        let targetPage=this.currentPage-1;
        let result=this.renderProductsList(targetPage);
        if(result){
            this.previousPage=this.currentPage;
            this.currentPage=targetPage;
            this.switchActiveStatus(targetPage);
        }
            
    }

    //Swith page navigation active status
    switchActiveStatus(targetPage){
        if(this.totalPages<1)
            return;
        document.querySelector(".page-item.active").setAttribute("class","page-item numeric-item");
        let cssSelector=`.page-item:has(a.page-link[data-nav-page='${targetPage}'])`;
        let target=document.querySelector(cssSelector);
        target.setAttribute("class","page-item numeric-item active");
    }

    //note:if you evoke initPageNav(),it may be after calling reSetPageInfo()
    initPageNav(){
        let pageTemplate=document.getElementById("pageTemplate");
        let cssSelector=`.page-item:has(a.page-link[data-nav-page='next'])`;
        let renderNode=document.querySelector(cssSelector);

        //clear the numeric page items, otherwise it will be not accurate because the totalPages will be affected by filter or sort feature.
        this.clearNumericNavItems();

        //re-add the numeric page items
        for(let i=1;i<=this.totalPages;i++){
            let pageStr=i.toString();
            let clone=document.importNode(pageTemplate.content,true);
            if(i==1)
                clone.querySelector(".page-item").setAttribute("class","page-item numeric-item active"); //default to select the first page
            else
                clone.querySelector(".page-item").setAttribute("class","page-item numeric-item");
            clone.querySelector(".page-link").setAttribute("data-nav-page",pageStr); 
            clone.querySelector(".page-link").textContent=pageStr;
            renderNode.before(clone);
        }

        return true;
    }

    clearNumericNavItems(){
        let numericItems=document.querySelectorAll("li.numeric-item");
        for(let item of numericItems)
            item.remove();
    }

    //Sort feature
    setResultProductList(array){
        this.resultProductList=structuredClone(array);
    }

    reSetPageInfo(){
        this.totalPages=Math.ceil(this.resultProductList.length/this.pageSize);
        this.currentPage=1;
        this.previousPage=1;
    }

    renderAfterSortOrFilter(){
        this.reSetPageInfo();
        let result=this.renderProductsList(this.currentPage);
        if(result){
            this.initPageNav();  //because after filtering, the total page size may change.
            this.switchActiveStatus(this.currentPage);
        }
    }

    sortProducts(event){
        const value=document.getElementById("sort").value;
        console.log("sort value is "+value);
        switch(value){
            case "default":
                this.productListContainer.resetSortedOrder();
                break;
            case "ascendByPrice":
                this.productListContainer.sortedPriceAscent();
                break;
            case "descendByPrice":
                this.productListContainer.sortedPriceDescent();
                break;
            case "ascendByDate":
                this.productListContainer.sortedDateAscent();
                break;
            case "descendByDate":
                this.productListContainer.sortedDateDescent();
                break;
            default:
                break;
        }
        this.setResultProductList(this.productListContainer.sortedArray);
        this.renderAfterSortOrFilter();
    }

    //category feature,filter category
    changeCategory(event){
        let targetCategory=event.target.dataset.categoryId;
        this.productListContainer.resetFilteredArray();
        if(targetCategory!=="all") //if is all, do not filter
        {
            this.productListContainer.filterByCategory(targetCategory);
        }
        this.filterConditionsMap.set("category",targetCategory);
        this.productListContainer.filterByConditions(this.filterConditionsMap);
        
        this.setResultProductList(this.productListContainer.filteredArray);
        this.renderAfterSortOrFilter();
        this.setProductContentHeader(targetCategory);

        //change the active category
        let currentActiveCategory=document.querySelector(".category .category-item.active");
        if(currentActiveCategory)
            currentActiveCategory.setAttribute("class","category-item");
        event.target.setAttribute("class","category-item active");
        this.filterConditionsMap.set("category",targetCategory);
        this.resetSortOrderToDefault();
    }

    resetSortOrderToDefault(){
        document.getElementById("sort").value="default";
    }

    setProductContentHeader(category){
        let text=category[0].toUpperCase() + category.slice(1);
        document.querySelector(".product-category-header").textContent=text;
    }

    //filter offcanvas
    initPriceSlider(){
        console.log("initPriceSlider() is called.");
        let minPrice=0;
        let maxPrice=0;
        const findMaxPrice=()=> {
            let len = this.productListContainer.productArray.length;
            let max = 0;
            while (len--) {
                if (this.productListContainer.productArray[len].price > max) {
                    max = this.productListContainer.productArray[len].price;
                }
            }
            return max;
        }
        const findMinPrice=()=> {
            let len = this.productListContainer.productArray.length;
            let min = Infinity;
            while (len--) {
                if (this.productListContainer.productArray[len].price < min) {
                    min = this.productListContainer.productArray[len].price;
                }
            }
            return min;
        }
        // Set initial value
        minPrice=findMinPrice();
        maxPrice=findMaxPrice();     
        
        const rangeLow = document.getElementById('rangeLow');
        const rangeHigh = document.getElementById('rangeHigh');
        const lowPrice = document.getElementById('lowPrice');
        const hightPrice = document.getElementById('hightPrice');
        rangeLow.min=minPrice;
        rangeLow.max=maxPrice;
        rangeHigh.min=minPrice;
        rangeHigh.max=maxPrice;

        if(this.filterConditionsMap.has("priceFilterRange")){
            lowPrice.textContent=rangeLow.value=this.filterConditionsMap.get("priceFilterRange").min;
            hightPrice.textContent=rangeHigh.value=this.filterConditionsMap.get("priceFilterRange").max;
        }else{
            lowPrice.textContent = rangeLow.value=minPrice;  
            hightPrice.textContent = rangeHigh.value=maxPrice;
        }
    }

    initFilterConditions(filterVar,set){
        let renderNode=document.querySelector(`#filter-${filterVar} .list-group`);
        while (renderNode.firstChild) {
            console.log("clear filter condition")
            renderNode.removeChild(renderNode.firstChild);
        }

        let filterListTemplate=document.getElementById("filterListTemplate");
        let i=1;
        for(let element of set){
            let clone=document.importNode(filterListTemplate.content,true);
            let input=clone.querySelector("input");
            input.setAttribute("id",`filter-${filterVar}-${i}`);
            input.setAttribute("class","form-check-input me-1 input-filter-condition");
            input.setAttribute("name",filterVar);
            input.setAttribute("value",element);

            let label=clone.querySelector("label");
            label.setAttribute("for",`filter-${filterVar}-${i}`);
            label.textContent=element;
            renderNode.append(clone);
            i++;
        }
    }

    initFilterPane(){
        console.log("initFilterPane() is called.");
        this.initPriceSlider(); 
        
        this.initFilterConditions("gender",this.productListContainer.getGenderSet());
        this.initFilterConditions("size",this.productListContainer.getSizeSet());
        this.initFilterConditions("color",this.productListContainer.getColorSet());
        this.initFilterConditions("brand",this.productListContainer.getBrandSet());
        this.initFilterConditions("discount",this.productListContainer.getDiscountSet());
        this.initFilterConditions("date",this.productListContainer.getDateSet());
    }

    setFilterConditions(){
        //stock, gender,size,color,brand,discount and date
        this.filterConditionsMap.forEach((value,key) => {
            if(!["category","availability","priceFilterRange"].includes(key))
               this.filterConditionsMap.delete(key); 
        });


        let inStock=document.getElementById("filter-availability-1").checked;
        let outStock=document.getElementById("filter-availability-2").checked;
        this.filterConditionsMap.set("availability",{in:inStock,out:outStock});

        let filters=document.getElementsByClassName("input-filter-condition");
        for(let filter of filters){
            if(!filter.checked)  //Not-selected filter condition should not be included
                continue;
            if(this.filterConditionsMap.has(filter.name)){
                let arr=this.filterConditionsMap.get(filter.name);
                arr.push(filter.value.toLowerCase());
                this.filterConditionsMap.set(filter.name, arr);
            }else{
                this.filterConditionsMap.set(filter.name, [filter.value.toLowerCase()]);
            }
        }
    }

    filterProducts(){
        console.log("filterProducts() is called.");
        this.setFilterConditions();
        
        this.productListContainer.filterByConditions(this.filterConditionsMap);
        this.setResultProductList(this.productListContainer.filteredArray);
        this.renderAfterSortOrFilter();
        this.resetSortOrderToDefault();
    }

    filterEventListener(){
        const offcanvasFilter = document.getElementById('offcanvasFilter');
        
        offcanvasFilter.addEventListener('hidden.bs.offcanvas', event =>this.filterProducts());     //execute filtering after closing the filter pane, 
        
        const rangeLow = document.getElementById('rangeLow');
        const rangeHigh = document.getElementById('rangeHigh');
        const lowPrice = document.getElementById('lowPrice');
        const hightPrice = document.getElementById('hightPrice');
        rangeLow.addEventListener('input', ()=> {
            if(Number(rangeLow.value)>Number(rangeHigh.value)){
                rangeLow.value=rangeHigh.value;
            }
            lowPrice.textContent = rangeLow.value;
            this.filterConditionsMap.set("priceFilterRange",{min:rangeLow.value,max:rangeHigh.value});
        });

        rangeHigh.addEventListener('input', ()=> {
            if(Number(rangeLow.value)>Number(rangeHigh.value)){
                rangeHigh.value=rangeLow.value;
            }
            hightPrice.textContent = rangeHigh.value;
            this.filterConditionsMap.set("priceFilterRange",{min:rangeLow.value,max:rangeHigh.value});
        });
        document.getElementById("filter-all-select").addEventListener('change',()=>this.selectAllFilterConditions());

    }
    selectAllFilterConditions(){
        let selectAll=document.getElementById("filter-all-select");
        let checkboxList=document.querySelectorAll("#offcanvasFilter input[type='checkbox']");
        for(let checkbox of checkboxList){
            checkbox.checked=selectAll.checked;
        }       
    }

}

let list=new ProductList();
list.parseProducts(productJSON);
productListView=new ProductListView(list);

//Add event listerner and some initial work after the entire page have benn loaded to avoid unaccessiblitiy
document.addEventListener("DOMContentLoaded", ()=>{  
        productListView.renderProductsList();
        productListView.initPageNav();
        document.querySelector("ul.pagination").addEventListener("click", e=>productListView.switchPage(e));
        document.getElementById("sort").addEventListener("change", e=>productListView.sortProducts(e));
        document.querySelector(".sidebar .category").addEventListener("click", e=>productListView.changeCategory(e));       
        productListView.initFilterPane();
        productListView.filterEventListener();
    }
);
