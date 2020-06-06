import Vue from "vue";
import { VNode } from "vue/types/umd";


const MessageComponent = Vue.extend({
    template: `<div class="message shadow-sm">
                <i class="far fa-times-circle message-close"></i>
                <div class="row">
                    <div class="col-md-1">
                        <img src="../static/img/icon.png" alt="profilepic" class="profile-picture">
                    </div>
                    <div class="col-md-11">
                        <p>username</p>
                        <hr>
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima alias, laudantium eligendi quae corrupti ipsum quasi similique placeat maxime accusamus enim perspiciatis asperiores sequi ullam nulla distinctio consequatur quas reiciendis.</p>
                    </div>
                </div>
            </div>`,
    render(createElement): VNode {
        return createElement()
    }
  })
