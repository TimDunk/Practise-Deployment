class ProductList{
    parseProducts(productList){
        let products=JSON.parse(productList);
        this.productArray=structuredClone(products);
        this.filteredArray=structuredClone(products);
        this.sortedArray=structuredClone(products);
    }

    
    resetSortedOrder(){
        //sort by id as the default order
        this.sortedArray=structuredClone(this.filteredArray);
        this.sortedArray.sort(
            (a,b)=>{
                return a.id-b.id;
            }
        );
    }

    resetFilteredArray(){
        this.filteredArray=structuredClone(this.productArray);
        this.sortedArray=this.filteredArray; //NOTE: because sort should be against the filtered items
    }

    //filter 
    //intersect various filtering results
    intersectArrByID(arrOfArr) {
        let key="id";
        const intersect=(arrA,arrB)=>{
            let mapArrB=arrB.map(obj => [obj[key], obj]);
            const mapB = new Map(mapArrB);
            return arrA.filter(obj => mapB.has(obj[key]));
        };

        let len=arrOfArr.length;
        let result=arrOfArr[0];
        for(let i=1;i<len;i++){
            let tmp=intersect(result,arrOfArr[i]);
            result=tmp;
        }
        return result;
    }
    //union various filtering results
    unionArrByID(arrOfArr){
        const union=(arrA,arrB)=>{
            const setA = new Set(arrA);
            const setB = new Set(arrB);
            const unionResult = new Map();
            setA.forEach(o => unionResult.set(o.id, o));
            setB.forEach(o => unionResult.set(o.id, o));
            return [...unionResult.values()];
        };
        let len=arrOfArr.length;
        let result=arrOfArr[0];
        for(let i=1;i<len;i++){
            let tmp=union(result,arrOfArr[i]);
            result=tmp;
        }
        return result;     
    }

    filterByConditions(conditions){
        let resultArr=[];
        
        conditions.forEach(
            (value,key)=>{
                switch(key){
                    case "availability":
                        resultArr.push(this.filterByStock(value));
                        break;
                    case "priceFilterRange":
                        resultArr.push(this.filterByPrice(value.min,value.max));
                        break;
                    case "category":
                        resultArr.push(this.filterByCategory(value));
                        break;
                    default:
                        resultArr.push(this.filterBy(key,value));
                        break;
                }
            }
        );
        this.filteredArray=this.intersectArrByID(resultArr); //
        this.sortedArray=this.filteredArray;
        return structuredClone(this.filteredArray);
          
    }

    filterByPrice(lowPrice=0.0,highPrice=Infinity){
       let array=structuredClone(this.productArray);
       array=array.filter(
            product=>{
                return (product.price >= lowPrice) && (product.price<=highPrice);
            }
        );
       console.log(array);
       return array;
    }

    filterByStock(availability){
        if(!availability.in && !availability.out)
            return structuredClone(this.productArray);

        let array1=structuredClone(this.productArray);
        let array2=structuredClone(this.productArray);
        array1=array1.filter(
            product=>{
                if(availability.in)
                    return product.stock>0;
            }
        );
        array2=array2.filter(
            product=>{
                if(availability.out)
                    return product.stock==0;
            }
        );
        return this.unionArrByID([array1,array2]);
    }

    filterByCategory(category){
        let array=structuredClone(this.productArray);
        if(category!=="all")
        {
            array=array.filter(
                product=>{
                    return product.category.toLowerCase()==category;
                }
            );   
        }
        
        this.sortedArray=array; //Note, because sort should be against the filtered items
        this.filteredArray=array;
        return structuredClone(array);
    }

    filterBy(property, condition) 
    {
        let array = structuredClone(this.productArray); 
        array = array.filter(
            product => 
            { 
                const value = product[property].toString().toLowerCase(); 
                return condition.includes(value); 
            }); 
        this.sortedArray = array; 
        this.filteredArray = array; 
        return structuredClone(array); 
    }

    // sort methods
    sortedPriceAscent(){
        this.sortedArray.sort(
            (a,b)=>{
                return a.price-b.price;
            }
        );
    }
    sortedPriceDescent(){
        this.sortedArray.sort(
            (a,b)=>{
                return b.price-a.price;
            }
        );
    }
    sortedDateAscent(){
        this.sortedArray.sort(
            (a,b)=>{
                let date_a=new Date(a.date);
                let date_b=new Date(b.date);
                return date_a-date_b;
            }
        );

    }
    sortedDateDescent(){
        this.sortedArray.sort(
            (a,b)=>{
                let date_a=new Date(a.date);
                let date_b=new Date(b.date);
                return date_b-date_a;
            }
        );

    }
    //The size is the number of children of the filter condition element should be appended
    getSizeSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.size);
        });
        return sizeSet;
    }
    getColorSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.color);
        });
        return sizeSet;
    }
    getGenderSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.gender);
        });
        return sizeSet;
    }
    getDiscountSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.discount);
        });
        return sizeSet;
    }
    getBrandSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.brand);
        });
        return sizeSet;
    }
    getDateSet(){
        let sizeSet=new Set();
        this.filteredArray.forEach(element => {
            sizeSet.add(element.date);
        });
        return sizeSet;
    }

}



