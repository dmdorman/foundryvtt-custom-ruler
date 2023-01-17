Hooks.on("init", function() {
    CustomRuler.initialize()

    //CustomRuler.log(false, Ruler)
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CustomRuler.ID);
});

Hooks.on("renderApplication", (controls, ...args) => {
    CustomRuler.log(false, "renderApplication");

    if (controls.tool === "ruler") {
        const userId = game.userId;

        CustomRuler.customRulerForm.verifySystemRulerExists(userId)

        CustomRuler.customRulerForm.render(true, {userId})
    }
});

/*
Hooks.once("init", () => {
    Ruler.prototype._getSegmentLabel = function _getSegmentLabel(segmentDistance, totalDistance, isTotal) {
        let rangeMod = Math.ceil(Math.log2(totalDistance / 8)) * 2;

        rangeMod = rangeMod < 0 ? 0: rangeMod;

        let label = "[" + Math.round(segmentDistance.distance) + " m]" +  "\n-" + rangeMod + " Range Modifier"

        return label
    };
})
*/

/**
 * A single CustomRuler
 * @typedef {Object} CustomRuler
 * @property {string} userId - the user's id which owns this VelocityTracker
 * @property {string} id - A unique ID to identify this VelocityTracker
 * @property {string} label - The name of the character/vehicle being tracked
 * @property {string} equation - rules for the new ruler
 * @property {Boolean} active - which ruler is being used
 * @property {float} lowerBound - which ruler is being used
 * @property {float} upperBound - which ruler is being used
 * @property {Boolean} protected - can a ruler be edited? These would be system rulers or those defined by the GM
 */
class CustomRulerData {
        static get allCustomRulers() {
            const allCustomRulers = game.users.reduce((accumulator, user) => {
                const userVelocityTrackers = this.getCustomRulersForUser(user.id);
    
                return {
                    ...accumulator,
                    ...userVelocityTrackers
                }
            }, {});
    
            return allCustomRulers
        }
        
        static getCustomRulersForUser(userId) {
            return game.users.get(userId)?.getFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER)
        }

        static getActiveRulerForUser(userId) {
            for (const [key, value] of Object.entries(this.getCustomRulersForUser(userId))) {
                CustomRuler.log(false, value)
                if (value.active) return this.allCustomRulers[key]
            }
        }

        static otherUsersCustomRulers(userId) {
            const otherUsersCustomRulers = game.users.reduce((accumulator, user) => {1
                if (user.id !== userId) {
                    const userCustomRulers = this.getCustomRulersForUser(user.id);
    
                    return {
                        ...accumulator,
                        ...userCustomRulers
                    }
                }
            }, {});
    
            return otherUsersCustomRulers
        }
    
        static createCustomRuler(userId, data) {
            CustomRuler.log(false, data)

            const newCustomRuler = {
                userId,
                id: foundry.utils.randomID(16),
                equation: "",
                lowerBound: null,
                upperBound: null,
                active: false,
                ...data
            }
    
            const update = {
                [newCustomRuler.id]: newCustomRuler
            }
    
            return game.users.get(userId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, update)
        }
    
        static updateCustomRuler(customRulerId, updateData) {
            const relevantCustomRuler = this.allCustomRulers[customRulerId];
    
            const update = {
                [customRulerId]: updateData
            }
    
            return game.users.get(relevantCustomRuler.userId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, update);
        }
    
        static updateUserCustomRuler(userId, updateData) {
            return game.users.get(userId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, updateData);
        }
    
        static deleteCustomRuler(customRulerId) {
            CustomRuler.log(false, customRulerId)

            const relevantCustomRuler = this.allCustomRulers[customRulerId];
    
            const keyDeletion = {
                [`-=${customRulerId}`]: null
            }

            CustomRuler.log(false, relevantCustomRuler)
    
            return game.users.get(relevantCustomRuler.userId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, keyDeletion)
        }

        static setRuler(userId) {
            const relevantCustomRuler = CustomRulerData.getActiveRulerForUser(userId)
            CustomRuler.log(false, "-------------------")
            CustomRuler.log(false, relevantCustomRuler.label)
            if (relevantCustomRuler.label === CustomRuler.SYSTEMRULER) {
                CustomRuler.log(false, "lets use the system ruler!")

                CustomRuler.log(false, CustomRuler.systemRuler)
                CustomRuler.log(false, CustomRuler.systemRuler.prototype._getSegmentLabel)

                CustomRuler.log(false, CustomRuler.systemRulerGetSegement)
                Ruler.prototype._getSegmentLabel = CustomRuler.systemRuler.prototype._getSegmentLabel

                return
            }

            CustomRuler.log(false, "8888888888888888888888888")


            Ruler.prototype._getSegmentLabel = function _getSegmentLabel(segmentDistance, totalDistance, isTotal) {
                const relevantCustomRuler = CustomRulerData.getActiveRulerForUser(userId)

                let newDistance = eval(relevantCustomRuler.equation.replaceAll("x", segmentDistance.distance.toString()))
                
                if (relevantCustomRuler.lowerBound !== null) newDistance = Math.max(newDistance, relevantCustomRuler.lowerBound)

                if (relevantCustomRuler.upperBound !== null) newDistance = Math.min(newDistance, relevantCustomRuler.upperBound)

                let output = "[" + Math.round(segmentDistance.distance) + " m]\n" + newDistance + " " + relevantCustomRuler.label
        
                return output
            };
        }
}

class CustomRuler {
    static initialize() {
        this.customRulerForm = new CustomRulerForm()

        //this.systemRuler = Ruler
        this.systemRuler = Object.create(Ruler);
        //this.systemRuler = Object.assign({}, Ruler);
        this.systemRulerGetSegement = Ruler.prototype._getSegmentLabel().bind({})

        // gm can see all custom rulers
        game.settings.register(this.ID, this.SETTINGS.GM_CAN_SEE_ALL, {
            name: `CUSTOM-RULER.settings.${this.SETTINGS.GM_CAN_SEE_ALL}.Name`,
            default: true,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `CUSTOM-RULER.settings.${this.SETTINGS.GM_CAN_SEE_ALL}.Hint`,
            onChange: () => ui.players.render()
        })
    }

    static ID = 'custom-ruler';

    static FLAGS = {
        CUSTOMRULER: 'custom-ruler'
    }

    static TEMPLATES = {
        CustomRuler: `./modules/${this.ID}/templates/custom-ruler.hbs`
    }

    static SETTINGS = {
        GM_CAN_SEE_ALL: 'gm-can-see-all'
    }

    static SYSTEMRULER = "system ruler"

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}

class CustomRulerForm extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 1000,
            id: CustomRuler.id,
            template: CustomRuler.TEMPLATES.CustomRuler,
            title: "CUSTOM-RULER.title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        return {
            customRulers: CustomRulerData.getCustomRulersForUser(options.userId)
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);

        await CustomRulerData.updateUserCustomRuler(this.options.userId, expandedData);

        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;
        const customRulerId = clickedElement.parents('[data-custom-ruler-id]')?.data()?.customRulerId;

        switch(action) {
            case 'create': {
                await CustomRulerData.createCustomRuler(this.options.userId);
                this.render();
                break;
            }

            case 'delete': {
                const confirmed = await Dialog.confirm({
                    title: game.i18n.localize("CUSTOM-RULER.confirm.deleteConfirm.Title"),
                    content: game.i18n.localize("CUSTOM-RULER.confirm.deleteConfirm.Content")
                });

                if (confirmed) {
                    await CustomRulerData.deleteCustomRuler(customRulerId);
                    this.render();
                }

                break;
            }

            case 'activate': {
                let updates = {};

                for (const [key, value] of Object.entries(CustomRulerData.getCustomRulersForUser(this.options.userId))) {
                    updates[`${key}.active`] = (key === customRulerId) ? true : false
                }

                await CustomRulerData.updateUserCustomRuler(this.options.userId, updates)

                CustomRulerData.setRuler(this.options.userId)

                break;
            }

            default:
                CustomRuler.log(false, 'Invalid action detected', action)
        }
    }

    verifySystemRulerExists(userId) {
        let systemRulerExists = false

        if (CustomRulerData.getCustomRulersForUser(userId) !== undefined) {
            for (const [key, value] of Object.entries(CustomRulerData.getCustomRulersForUser(userId))) {
                if (value.label === CustomRuler.SYSTEMRULER) systemRulerExists = true
            }
        }

        if (!systemRulerExists) {
            CustomRulerData.createCustomRuler(userId, {label: CustomRuler.SYSTEMRULER, protected: true, active: true})
        }
    }
}