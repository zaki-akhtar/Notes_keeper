<script>
        const arr=[];
        document.querySelector('.item-add-button').addEventListener('click',(e)=>{
           
            let x=document.querySelector('#item-add').value;
            let p=document.createElement('li');
            let button=document.createElement('button');
            button.setAttribute("name" ,"sub");
            button.setAttribute("value",`${x}`);
            button.setAttribute("type",`submit`);
            arr.push(x);
            arr.forEach(a=>{
                button.innerHTML=a;
                p.appendChild(button);
            })
          
           
            document.querySelector('.subject-itemList').appendChild(p);
            document.querySelector('#item-add').value="";
            e.preventDefault();
        })
    </script>