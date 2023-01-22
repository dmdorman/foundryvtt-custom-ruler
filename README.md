# Custom Ruler

a system-agnostic module that allows players to define custom ruler behavior

## How to Use

To open click the Ruler icon on the left hand side of the screen

<p align="center">
  <img src="https://github.com/dmdorman/foundryvtt-custom-ruler/blob/main/images/ruler-icon.PNG?raw=true" />
</p>

The Custom Ruler select window will open. At first it will be empty (unless the GM has already defined and shared custom rulers). 

To add new Rulers click the '+ Add New Ruler' button.

After defining a few rulers it will look something like the image below for players...

<p align="center">
  <img src="https://github.com/dmdorman/foundryvtt-custom-ruler/blob/main/images/player-view.PNG?raw=true" />
</p>

or for GMs it will look like the image below.

<p align="center">
  <img src="https://github.com/dmdorman/foundryvtt-custom-ruler/blob/main/images/dm-view.PNG?raw=true" />
</p>

## Custom Ruler Fields

'Active?' - Which ruler is currently being used. Only one can be selected at a time per person. Each person can have a different ruler selected.

'Label' - This is part of what will be displayed when measuring with this ruler. Best used as the name for the ruler.

'Equation' - This is what the ruler is measuring. In the field 'x' means the distance measured by the ruler. The equation defined is this field is evaluated using  javascript and so can take javascript formulas as input. For ease of use a few javascript math functions have already been defined. As of this release those functions are sin, cos, tan, log, log2, log10, ceil, and floor. 

'Lower Bound' - The minimum number that will appear on the custom ruler.

'Upper Bound' - The maximum number that will appear on the custom ruler.

'Share?' - Only available for GMs. This option allows the GM to make their custom ruler appear on the players' Custom Ruler Select window.

'Delete?' - Deletes the associated ruler. Players cannot delete rulers that have been shared with them.
