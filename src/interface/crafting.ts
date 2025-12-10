import "./crafting.style.css";
import { Items, type Item, type ItemInfoCraftable, type ItemInfoModule } from "../story";
import scanner from "../assets/satellite-dish.png";
import Alpine from "alpinejs";

const tpl = `
    <div class="interface-crafting" x-data="recipes">
        <div class="list">
            <template x-for="recipe in recipes">
              <div class="recipe" :class="item === recipe.name ? 'selected' : ''" @click="click(recipe.name)" :data-quality="recipe.quality">
                <img :src="recipe.img" width="32" height="32"></img>
                <div class="flex-col">
                    <div x-text="recipe.label"></div>
                    <div x-text="recipe.type"></div>
                </div>
              </div>
            </template>
        </div>
        <div class="info">
            <template x-if="info">
              <div>
                <div x-text="info.label"></div>
                <div x-text="info.description"></div>
                <div class="flex-row gap crafting-material">
                    <template x-for="ingredient in info.ingredients">
                      <div :class="($store.inventory.items[ingredient.item] ?? 0) >= ingredient.count ? 'available' : ''">
                        <span x-text="ingredient.item"></span>[<span x-text="ingredient.count"></span>]
                      </div>
                    </template>
                </div>
                <div x-show="$store.inventory.craftable[info.name]">
                    <button>Craft</button>
                </div>
              </div>
            </template>
        </div>
    </div>
`;

export const display_Crafting = (modal: HTMLDivElement) => {
    modal.classList.remove("hidden");
    modal.innerHTML = tpl;
    const recipes: Item[] = ["module_visual_scanner", "module_basic_drill", "module_basic_battery", "module_basic_motor", "module_basic_store","module_home_navigation",
        "deployable_automation_hull"];

    Alpine.data("recipes", () => ({
        click(item: Item) {
            this.item = item as any;
        },
        item: undefined,
        recipes: recipes.map(
            (item) => {
                const info = Items[item] as ItemInfoModule;
                return {
                    ...info,
                    img: scanner
                };
            }
        ),
        get info() {
            if (this.item) {
                return Items[this.item]
            }
            return undefined;
        }
    }));
    Alpine.initTree(modal);
};
