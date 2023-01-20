Hooks.on("init", function() {
    CustomRuler.initialize()
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CustomRuler.ID);
});

Hooks.on("renderApplication", (controls, ...args) => {
    if (controls.tool === "ruler") {
        const userId = game.userId;

        CustomRuler.customRulerForm.render(true, {userId})
    }
});

/**
 * A single CustomRuler
 * @typedef {Object} CustomRuler
 * @property {string} userId - the user's id which owns this CustomRuler
 * @property {string} id - A unique ID to identify this CustomRuler
 * @property {string} label - The name of the character/vehicle being tracked
 * @property {string} equation - rules for the new ruler
 * @property {Boolean} active - which ruler is being used
 * @property {float} lowerBound - which ruler is being used
 * @property {float} upperBound - which ruler is being used
 * @property {Boolean} protected - can a ruler be edited? These would be system rulers or those defined by the GM
 * @property {Boolean} share - should other players be able to see this ruler? Only used by GMs
 */
class CustomRulerData {
    static get allCustomRulers() {
        const allCustomRulers = game.users.reduce((accumulator, user) => {
            const userCustomRulers = this.getCustomRulersForUser(user.id);

            return {
                ...accumulator,
                ...userCustomRulers
            }
        }, {});

        return allCustomRulers
    }
    
    static getCustomRulersForUser(userId) {
        return game.users.get(userId)?.getFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER)
    }

    static getActiveRulerForUser(userId) {
        for (const [key, value] of Object.entries(this.getCustomRulersForUser(userId))) {
            if (value.active) return this.allCustomRulers[key]
        }
    }

    static otherUsersCustomRulers(userId) {
        const otherUsersCustomRulers = game.users.reduce((accumulator, user) => {
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

    static copyCustomRuler(newUserId, originalUserId, rulerId) {
        const relevantCustomRuler = CustomRulerData.getCustomRulersForUser(originalUserId)[rulerId];

        const copyCustomRuler = {
            userId : newUserId,
            id : relevantCustomRuler.id,
            label: relevantCustomRuler.label,
            equation : relevantCustomRuler.equation,
            lowerBound : relevantCustomRuler.equation,
            upperBound : relevantCustomRuler.equation,
            active: false,
            protected: true,
        }

        const update = {
            [copyCustomRuler.id]: copyCustomRuler
        }

        return game.users.get(newUserId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, update)
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

    static deleteCustomRuler(customRulerId, userId) {
        const relevantCustomRuler = CustomRulerData.getCustomRulersForUser(userId)[customRulerId];

        const keyDeletion = {
            [`-=${customRulerId}`]: null
        }

        return game.users.get(relevantCustomRuler.userId)?.setFlag(CustomRuler.ID, CustomRuler.FLAGS.CUSTOMRULER, keyDeletion)
    }

    static addSharedRuler(originalUserId, relevantCustomRulerId) {
        game.users.forEach(user => {
            if (user.id !== originalUserId) {
                CustomRulerData.copyCustomRuler(user.id, originalUserId, relevantCustomRulerId)
            }
        }, {});
    }

    static deleteSharedRuler(originalUserId, customRulerId) {
        game.users.forEach(user => {
            if (user.id !== originalUserId) {
                CustomRulerData.deleteCustomRuler(customRulerId, user.id)
            }
        }, {});
    }

    static setRuler() {
        Ruler.prototype._getSegmentLabel = function _getSegmentLabel(segmentDistance, totalDistance, isTotal) {
            const relevantCustomRuler = CustomRulerData.getActiveRulerForUser(this.user.id)

            let newEquation = relevantCustomRuler.equation.toLowerCase();

            for (const [key, value] of Object.entries(CustomRuler.RULERTRANSLATIONS)) {
                newEquation = newEquation.replaceAll(key, value)
            }

            const distance = segmentDistance.distance.toString()

            let newDistance = Math.round(eval(newEquation))

            if (!isNaN(parseInt(relevantCustomRuler.lowerBound) && newDistance < relevantCustomRuler.lowerBound)) {
                newDistance = Math.max(newDistance, relevantCustomRuler.lowerBound)
            }

            if (!isNaN(parseInt(relevantCustomRuler.upperBound)) && newDistance > relevantCustomRuler.upperBound) {
                newDistance = Math.min(newDistance, relevantCustomRuler.upperBound)
            }

            const output = "[" + Math.round(segmentDistance.distance) + " m]\n" + newDistance + " " + relevantCustomRuler.label
    
            return output
        };
    }

    
}
class CustomRuler {
    static initialize() {
        this.customRulerForm = new CustomRulerForm()

        CustomRulerData.setRuler()
    }

    static ID = 'custom-ruler';

    static FLAGS = {
        CUSTOMRULER: 'custom-ruler'
    }

    static TEMPLATES = {
        CustomRuler: `./modules/${this.ID}/templates/custom-ruler.hbs`
    }

    static SETTINGS = {}

    static RULERTRANSLATIONS = {
        "x": "distance",
        "sin(": "Math.sin(",
        "cos(": "Math.cos(",
        "tan(": "Math.tan(",
        "log(": "Math.log(",
        "log2(": "Math.log2(",
        "log10(": "Math.log10(",
        "ceil(": "Math.ceil(",
        "floor(": "Math.floor("
    }

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
            width: 600,
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
            isGM : game.users.get(options.userId)?.isGM,
            customRulers: CustomRulerData.getCustomRulersForUser(options.userId),
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
        const relevantCustomRuler = CustomRulerData.getCustomRulersForUser(game.userId)[customRulerId]

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

                if (relevantCustomRuler.shared) CustomRulerData.deleteSharedRuler(game.userId, customRulerId)

                if (confirmed) {
                    await CustomRulerData.deleteCustomRuler(customRulerId, game.userId);
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

                break;
            }

            case 'share' : {
                const shouldShare = ! relevantCustomRuler.shared

                if (shouldShare) return CustomRulerData.addSharedRuler(game.userId, customRulerId);
                
                return CustomRulerData.deleteSharedRuler(game.userId, customRulerId)

                break;
            }

            default:
                CustomRuler.log(false, 'Invalid action detected', action)
        }
    }
}