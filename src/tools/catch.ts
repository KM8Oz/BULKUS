

export const cachdirmy = {
    
     get value() : string {
        return this.back
    },
    
     set value(v : string) {
        this.back = v;
    },
    back: "../../"
} 
export const pathsettingsmy = {
    
    get value() : string {
       return this.back
   },
   
    set value(v : string) {
       this.back = v;
   },
   back: cachdirmy.value+"_settings.dat"
} 
export const pathsemailssmy = {
    
    get value() : string {
       return this.back
   },
   
    set value(v : string) {
       this.back = v;
   },
   back: cachdirmy.value+"_emails.dat"
} 